import { LavalinkManager } from 'lavalink-client';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { COLORS, IDLE_TIMEOUT } from './config.js';
import { formatDuration, createProgressBar, truncate } from './utils/helpers.js';
import { logger } from './utils/logger.js';
import { GuildSettings } from './database/GuildSettings.js';
import { PlayerData } from './structures/Player.js';
import { getAutoplayTrack } from './systems/AutoplaySystem.js';

export function initLavalink(client) {
  const lavalink = new LavalinkManager({
    nodes: client.lavalinkNodes,
    sendToShard: (guildId, payload) => {
      client.guilds.cache.get(guildId)?.shard?.send(payload);
    },
    client: {
      id: process.env.CLIENT_ID || client.user?.id,
      username: client.user?.username || 'Music',
    },
    autoSkip: true,
    playerOptions: {
      defaultSearchPlatform: 'ytsearch',
      volumeDecrementer: 1,
      applyVolumeAsFilter: false,
      clientBasedPositionUpdateInterval: 150,
      onDisconnect: {
        autoReconnect: true,
        destroyPlayer: false,
      },
      onEmptyQueue: {
        destroyAfterMs: IDLE_TIMEOUT,
      },
    },
    linksAllowed: true,
  });

  client.lavalink = lavalink;

  // Node telemetry
  lavalink.nodeManager.on('connect', (node) => {
    logger.lavalink(`Connected to audio node: ${node.id} (${node.options.host}:${node.options.port})`);
  });
  lavalink.nodeManager.on('disconnect', (node, reason) => {
    logger.warn(`Audio node disconnected: ${node.id}. ${reason?.message || reason}`);
  });
  lavalink.nodeManager.on('error', (node, error) => {
    logger.error(`Audio node error [${node.id}]: ${error?.message || error}`);
  });
  lavalink.nodeManager.on('reconnecting', (node) => {
    logger.lavalink(`Reconnecting to audio node: ${node.id}...`);
  });

  // Track Start - Ultra detailed clean embed with rich audio details & interactive buttons
  lavalink.on('trackStart', async (player, track) => {
    if (player.customData) player.customData.touch();
    const settings = GuildSettings.get(player.guildId);
    if (!settings.announceTrack || !player.textChannelId) return;
    const channel = client.channels.cache.get(player.textChannelId);
    if (!channel) return;

    const requester = track.requester;
    const durStr = track.info.isStream ? '🔴 Live Stream' : formatDuration(track.info.duration);
    const progress = createProgressBar(0, track.info.duration, 16);

    const embed = new EmbedBuilder()
      .setColor(COLORS.primary)
      .setTitle(`🎵 ${truncate(track.info.title, 80)}`)
      .setURL(track.info.uri || 'https://discord.com')
      .setDescription([
        `**Artist:** \`${track.info.author || 'Unknown'}\``,
        `**Requested By:** <@${requester?.id || requester?.username || 'Unknown'}>`,
        '',
        `\`00:00\` ${progress} \`${durStr}\``,
        '',
        `🔊 **Volume:** \`${player.volume}%\` • 🔁 **Loop:** \`${(player.repeatMode || 'off').toUpperCase()}\` • 📜 **Queue:** \`${player.queue.tracks.length}\` track(s)`
      ].join('\n'))
      .setFooter({ 
        text: `Source: ${track.info.sourceName || 'Audio'} • Bitrate: High-Fidelity 320kbps` 
      });

    if (track.info.artworkUrl) {
      embed.setThumbnail(track.info.artworkUrl);
    }

    // Interactive button controls
    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('music_pause_resume').setEmoji('⏯️').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('music_skip').setEmoji('⏭️').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('music_shuffle').setEmoji('🔀').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('music_loop_toggle').setEmoji('🔁').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('music_stop').setEmoji('⏹️').setStyle(ButtonStyle.Danger),
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('music_vol_down').setEmoji('🔉').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('music_vol_up').setEmoji('🔊').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('music_autoplay').setEmoji('♾️').setLabel('Autoplay').setStyle(player.customData?.autoplay ? ButtonStyle.Success : ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('music_247').setEmoji('🌐').setLabel('24/7').setStyle(player.customData?.twentyFourSeven ? ButtonStyle.Success : ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('music_nowplaying').setEmoji('📜').setLabel('Queue').setStyle(ButtonStyle.Secondary),
    );

    try {
      if (player.customData?.nowPlayingMessage) {
        try { await player.customData.nowPlayingMessage.delete(); } catch {}
      }
      const msg = await channel.send({ embeds: [embed], components: [row1, row2] });
      if (player.customData) player.customData.nowPlayingMessage = msg;
    } catch (err) {
      logger.error('Failed to send trackStart message: ' + err.message);
    }
  });

  // Queue End / Autoplay
  lavalink.on('queueEnd', async (player, track) => {
    const settings = GuildSettings.get(player.guildId);
    const autoplay = player.customData?.autoplay || settings.autoplay;

    if (autoplay && track) {
      const nextTrack = await getAutoplayTrack(player, track);
      if (nextTrack) {
        await player.queue.add(nextTrack);
        await player.play();
        return;
      }
    }

    if (player.customData?.twentyFourSeven || settings.twentyFourSeven) {
      logger.music(`24/7 mode active for guild ${player.guildId}, remaining in voice channel.`);
      return;
    }

    const channel = client.channels.cache.get(player.textChannelId);
    if (channel) {
      const embed = new EmbedBuilder()
        .setColor(COLORS.warning)
        .setDescription('⏹️ **Queue ended.** Disconnecting in 3 minutes if no new songs are added.');
      channel.send({ embeds: [embed] }).catch(() => {});
    }

    setTimeout(async () => {
      if (player && !player.playing && player.queue.tracks.length === 0) {
        if (!(player.customData?.twentyFourSeven || settings.twentyFourSeven)) {
          await player.destroy('Idle timeout').catch(() => {});
        }
      }
    }, IDLE_TIMEOUT);
  });

  // Track Error
  lavalink.on('trackError', async (player, track, payload) => {
    logger.error(`Track playback error "${track?.info?.title}": ${payload?.exception?.message || 'Unknown'}`);
    const channel = client.channels.cache.get(player.textChannelId);
    if (channel) {
      const embed = new EmbedBuilder()
        .setColor(COLORS.error)
        .setDescription(`⚠️ Error loading **${truncate(track?.info?.title || 'Track', 60)}**. Skipping to next track...`);
      channel.send({ embeds: [embed] }).catch(() => {});
    }
  });

  // Track Stuck
  lavalink.on('trackStuck', async (player) => {
    logger.warn(`Track stuck in guild ${player.guildId}, skipping...`);
    await player.skip().catch(() => {});
  });

  // Voice disconnect recovery for 24/7 mode
  lavalink.on('playerDisconnect', async (player) => {
    const settings = GuildSettings.get(player.guildId);
    if (player.customData?.twentyFourSeven || settings.twentyFourSeven) {
      setTimeout(async () => {
        try { await player.connect(); } catch {}
      }, 1500);
    }
  });

  return lavalink;
}
