import { Client, GatewayIntentBits, Collection, ActivityType } from 'discord.js';
import { readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import 'dotenv/config';
import { initLavalink } from './lavalinkManager.js';
import { logger } from './utils/logger.js';
import { LAVALINK_NODES, BOT_ACTIVITY, DEFAULT_VOLUME } from './config.js';
import { PlayerData } from './structures/Player.js';
import { GuildSettings } from './database/GuildSettings.js';
import { hasDJPermission, handleVoteSkip } from './systems/DJSystem.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (!process.env.DISCORD_TOKEN) {
  logger.error('DISCORD_TOKEN is missing in .env file!');
  process.exit(1);
}

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  allowedMentions: { parse: ['users'] },
  rest: { timeout: 15000 },
});

client.commands = new Collection();
client.cooldowns = new Collection();
client.lavalinkNodes = LAVALINK_NODES;

// Load all commands recursively
async function loadCommands() {
  const cmdDir = join(__dirname, 'commands');
  const categories = await readdir(cmdDir);
  let total = 0;
  for (const category of categories) {
    try {
      const files = (await readdir(join(cmdDir, category))).filter((f) => f.endsWith('.js'));
      for (const file of files) {
        const mod = await import(pathToFileURL(join(cmdDir, category, file)).href);
        if (mod.data && mod.execute) {
          client.commands.set(mod.data.name, mod);
          total++;
        }
      }
    } catch {}
  }
  logger.success(`Loaded ${total} commands.`);
}

await loadCommands();

// Initialize Lavalink
const lavalink = initLavalink(client);

// Forward raw voice packets to Lavalink
client.on('raw', (d) => lavalink.sendRawData(d));

// ── Ready ──────────────────────────────────────────────
client.once('ready', async () => {
  logger.success(`Logged in as ${client.user.tag} (${client.user.id})`);
  logger.info(`Serving ${client.guilds.cache.size} guilds | ${client.commands.size} commands loaded`);

  await lavalink.init({ id: client.user.id, username: client.user.username });
  logger.success('Lavalink manager initialized.');

  // Rotating activity status
  let actIdx = 0;
  setInterval(() => {
    const act = BOT_ACTIVITY[actIdx % BOT_ACTIVITY.length];
    client.user.setActivity(act.name, { type: act.type });
    actIdx++;
  }, 15000);
});

// ── Interaction Create ─────────────────────────────────
client.on('interactionCreate', async (interaction) => {

  // ── Slash Commands ──────────────────────────────────
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    // Cooldown
    const cooldownKey = `${interaction.user.id}:${interaction.commandName}`;
    const now = Date.now();
    const cooldownMs = (command.cooldown || 3) * 1000;
    if (client.cooldowns.has(cooldownKey)) {
      const expires = client.cooldowns.get(cooldownKey);
      if (now < expires) {
        const remaining = ((expires - now) / 1000).toFixed(1);
        return interaction.reply({
          embeds: [new EmbedBuilder().setColor(COLORS.warning).setDescription(`⏳ Please wait **${remaining}s** before using this command again.`)],
          ephemeral: true,
        });
      }
    }
    client.cooldowns.set(cooldownKey, now + cooldownMs);
    setTimeout(() => client.cooldowns.delete(cooldownKey), cooldownMs);

    // Channel restriction
    const settings = GuildSettings.get(interaction.guildId);
    if (settings.restrictedChannelId && interaction.channelId !== settings.restrictedChannelId) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(COLORS.warning).setDescription(`⚠️ Music commands are restricted to <#${settings.restrictedChannelId}>.`)],
        ephemeral: true,
      });
    }

    // Voice channel check
    if (command.voiceOnly) {
      if (!interaction.member?.voice?.channel) {
        return interaction.reply({
          embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ You must be in a voice channel to use this command!')],
          ephemeral: true,
        });
      }
    }

    // Player required check
    if (command.playerRequired) {
      const player = lavalink.getPlayer(interaction.guildId);
      if (!player || !player.queue.current) {
        return interaction.reply({
          embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Nothing is currently playing!')],
          ephemeral: true,
        });
      }
    }

    // DJ check
    if (command.djOnly) {
      const player = lavalink.getPlayer(interaction.guildId);
      const allowed = await hasDJPermission(interaction, player);
      if (!allowed) {
        return interaction.reply({
          embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ You need the **DJ Role** or **Manage Guild** permission to use this command!')],
          ephemeral: true,
        });
      }
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      logger.error(`Command /${interaction.commandName}: ${error.message}`);
      const payload = { embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ An error occurred while executing this command!')], ephemeral: true };
      if (interaction.replied || interaction.deferred) await interaction.followUp(payload);
      else await interaction.reply(payload);
    }
    return;
  }

  // ── Button Interactions ─────────────────────────────
  if (interaction.isButton()) {
    const { customId, guildId } = interaction;
    if (!customId.startsWith('music_')) return;

    const member = interaction.member;
    if (!member?.voice?.channel) {
      return interaction.reply({ content: '❌ Join a voice channel first!', ephemeral: true });
    }

    const player = lavalink.getPlayer(guildId);
    if (!player) return interaction.reply({ content: '❌ No active player!', ephemeral: true });

    if (player.voiceChannelId !== member.voice.channel.id) {
      return interaction.reply({ content: '❌ You must be in the same voice channel as the bot!', ephemeral: true });
    }

    try {
      switch (customId) {
        case 'music_pause_resume':
          if (player.paused) { await player.resume(); await interaction.reply({ content: '▶️ Resumed playback.', ephemeral: true }); }
          else { await player.pause(); await interaction.reply({ content: '⏸️ Paused playback.', ephemeral: true }); }
          break;
        case 'music_skip':
          if (!player.queue.current) return interaction.reply({ content: '❌ Nothing to skip!', ephemeral: true });
          await player.skip();
          await interaction.reply({ content: '⏭️ Skipped!', ephemeral: true });
          break;
        case 'music_shuffle':
          if (player.queue.tracks.length < 2) return interaction.reply({ content: '❌ Need at least 2 tracks to shuffle!', ephemeral: true });
          await player.queue.shuffle();
          await interaction.reply({ content: `🔀 Shuffled ${player.queue.tracks.length} tracks!`, ephemeral: true });
          break;
        case 'music_loop_toggle': {
          const modes = ['off', 'track', 'queue'];
          const next = modes[(modes.indexOf(player.repeatMode || 'off') + 1) % modes.length];
          await player.setRepeatMode(next);
          await interaction.reply({ content: `🔁 Loop: **${next.toUpperCase()}**`, ephemeral: true });
          break;
        }
        case 'music_stop':
          await player.destroy('Button: stop');
          await interaction.reply({ content: '⏹️ Stopped and left voice channel.', ephemeral: true });
          break;
        case 'music_vol_down': {
          const v = Math.max(1, (player.volume || 80) - 10);
          await player.setVolume(v);
          await interaction.reply({ content: `🔉 Volume: **${v}%**`, ephemeral: true });
          break;
        }
        case 'music_vol_up': {
          const v = Math.min(150, (player.volume || 80) + 10);
          await player.setVolume(v);
          await interaction.reply({ content: `🔊 Volume: **${v}%**`, ephemeral: true });
          break;
        }
        case 'music_autoplay':
          if (player.customData) player.customData.autoplay = !player.customData.autoplay;
          await interaction.reply({ content: `♾️ Autoplay: **${player.customData?.autoplay ? 'ON' : 'OFF'}**`, ephemeral: true });
          break;
        case 'music_247':
          if (player.customData) player.customData.twentyFourSeven = !player.customData.twentyFourSeven;
          await interaction.reply({ content: `🌐 24/7 Mode: **${player.customData?.twentyFourSeven ? 'ON' : 'OFF'}**`, ephemeral: true });
          break;
        case 'music_nowplaying': {
          const curr = player.queue.current;
          if (!curr) return interaction.reply({ content: '❌ Nothing playing!', ephemeral: true });
          const bar = curr.info.isStream ? '🔴 LIVE' : `${createProgressBar(player.position || 0, curr.info.duration)}\n\`${formatDuration(player.position || 0)} / ${formatDuration(curr.info.duration)}\``;
          const embed = new EmbedBuilder().setColor(COLORS.primary)
            .setTitle('📊 Now Playing')
            .setDescription(`**[${curr.info.title}](${curr.info.uri})**\n${bar}`);
          await interaction.reply({ embeds: [embed], ephemeral: true });
          break;
        }
      }
    } catch (err) {
      logger.error('Button error: ' + err.message);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '⚠️ Failed to execute control.', ephemeral: true });
      }
    }
  }

  // ── Autocomplete ────────────────────────────────────
  if (interaction.isAutocomplete()) {
    const command = client.commands.get(interaction.commandName);
    if (command?.autocomplete) {
      try { await command.autocomplete(interaction); } catch {}
    }
  }
});

// Voice state update — bot alone detection
client.on('voiceStateUpdate', async (oldState, newState) => {
  if (!oldState.channelId) return;
  const player = lavalink.getPlayer(oldState.guild.id);
  if (!player || !player.voiceChannelId) return;
  const vc = oldState.guild.channels.cache.get(player.voiceChannelId);
  if (!vc) return;
  const humans = vc.members.filter((m) => !m.user.bot);
  if (humans.size === 0 && !(player.customData?.twentyFourSeven)) {
    const settings = GuildSettings.get(oldState.guild.id);
    if (settings.twentyFourSeven) return;
    setTimeout(async () => {
      const p = lavalink.getPlayer(oldState.guild.id);
      if (!p) return;
      const v2 = oldState.guild.channels.cache.get(p.voiceChannelId);
      if (!v2) return;
      const h2 = v2.members.filter((m) => !m.user.bot);
      if (h2.size === 0) {
        const ch = client.channels.cache.get(p.textChannelId);
        if (ch) ch.send({ embeds: [new EmbedBuilder().setColor(COLORS.warning).setDescription('👋 Everyone left the voice channel. Disconnecting...')] }).catch(() => {});
        await p.destroy('Alone in VC').catch(() => {});
      }
    }, ALONE_TIMEOUT);
  }
});

// Graceful shutdown
process.on('SIGINT', () => { logger.warn('Shutting down...'); client.destroy(); process.exit(0); });
process.on('SIGTERM', () => { logger.warn('Terminating...'); client.destroy(); process.exit(0); });
process.on('unhandledRejection', (reason) => logger.error(`Unhandled rejection: ${reason}`));

client.login(process.env.DISCORD_TOKEN);
