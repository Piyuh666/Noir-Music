import { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } from 'discord.js';
import { COLORS } from '../../config.js';
import { formatDuration, truncate } from '../../utils/helpers.js';
import { GuildSettings } from '../../database/GuildSettings.js';
import { PlayerData } from '../../structures/Player.js';

export const voiceOnly = true;
export const cooldown = 2;

export const data = new SlashCommandBuilder()
  .setName('play')
  .setDescription('Play any song or playlist from YouTube, Spotify, SoundCloud, or URL')
  .addStringOption((o) =>
    o.setName('query')
      .setDescription('Song title, artist name, YouTube/Spotify/SoundCloud link')
      .setRequired(true)
      .setAutocomplete(true)
  );

export async function autocomplete(interaction) {
  const focused = interaction.options.getFocused();
  if (!focused || focused.length < 2) return interaction.respond([]);
  try {
    const lavalink = interaction.client.lavalink;
    const res = await lavalink.search({ query: focused, source: 'ytsearch' }, interaction.user);
    const choices = (res?.tracks || []).slice(0, 10).map((t) => ({
      name: truncate(`${t.info.title} — ${t.info.author}`, 100),
      value: t.info.uri || focused,
    }));
    await interaction.respond(choices);
  } catch {
    await interaction.respond([]);
  }
}

export async function execute(interaction) {
  const voiceChannel = interaction.member.voice.channel;
  if (!voiceChannel) {
    return interaction.reply({ 
      embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ You must be in a voice channel to play music!')], 
      ephemeral: true 
    });
  }

  const perms = voiceChannel.permissionsFor(interaction.client.user);
  if (!perms.has(PermissionsBitField.Flags.Connect) || !perms.has(PermissionsBitField.Flags.Speak)) {
    return interaction.reply({ 
      embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ I need **Connect** and **Speak** permissions in your voice channel!')], 
      ephemeral: true 
    });
  }

  const query = interaction.options.getString('query');
  await interaction.deferReply();

  const lavalink = interaction.client.lavalink;
  const settings = GuildSettings.get(interaction.guildId);

  let player = lavalink.getPlayer(interaction.guildId);
  if (!player) {
    player = lavalink.createPlayer({
      guildId: interaction.guildId,
      voiceChannelId: voiceChannel.id,
      textChannelId: interaction.channelId,
      selfDeaf: true,
      selfMute: false,
      volume: settings.volume,
    });
    player.customData = new PlayerData();
  }

  if (!player.connected) await player.connect();

  try {
    const res = await player.search({ query, source: settings.defaultSearchPlatform }, interaction.user);
    if (!res || !res.tracks?.length) {
      return interaction.editReply({ 
        embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ No tracks found for **${truncate(query, 60)}**`)] 
      });
    }

    if (res.loadType === 'playlist') {
      await player.queue.add(res.tracks);
      const totalMs = res.tracks.reduce((a, t) => a + (t.info.duration || 0), 0);
      const embed = new EmbedBuilder()
        .setColor(COLORS.success)
        .setTitle('📁 Added Playlist to Queue')
        .setDescription(`Added **${res.tracks.length} tracks** from [${truncate(res.playlist?.title || 'Playlist', 60)}](${query})`)
        .addFields(
          { name: 'Total Duration', value: formatDuration(totalMs), inline: true },
          { name: 'Starting Position', value: `#${player.queue.tracks.length - res.tracks.length + 1}`, inline: true },
          { name: 'Queue Size', value: `${player.queue.tracks.length} songs`, inline: true }
        )
        .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

      await interaction.editReply({ embeds: [embed] });
    } else {
      const track = res.tracks[0];
      await player.queue.add(track);

      const embed = new EmbedBuilder()
        .setColor(COLORS.primary)
        .setTitle('🎵 Added to Queue')
        .setDescription(`[${truncate(track.info.title, 80)}](${track.info.uri})`)
        .addFields(
          { name: 'Artist', value: `\`${track.info.author || 'Unknown'}\``, inline: true },
          { name: 'Duration', value: `\`${track.info.isStream ? 'Live Stream' : formatDuration(track.info.duration)}\``, inline: true },
          { name: 'Position in Queue', value: `\`#${player.queue.tracks.length}\``, inline: true }
        )
        .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

      if (track.info.artworkUrl) {
        embed.setThumbnail(track.info.artworkUrl);
      }
      await interaction.editReply({ embeds: [embed] });
    }

    if (!player.playing && !player.paused) await player.play();
  } catch (err) {
    await interaction.editReply({ 
      embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`⚠️ Failed to load track: ${err.message}`)] 
    });
  }
}
