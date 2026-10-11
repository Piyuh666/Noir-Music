import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';
import { UserPlaylists } from '../../database/Playlists.js';
import { formatDuration, truncate } from '../../utils/helpers.js';
import { GuildSettings } from '../../database/GuildSettings.js';
import { PlayerData } from '../../structures/Player.js';

export const cooldown = 3;

export const data = new SlashCommandBuilder()
  .setName('playlist')
  .setDescription('Manage your personal playlists')
  .addSubcommand((s) => s.setName('create').setDescription('Create a new playlist').addStringOption((o) => o.setName('name').setDescription('Playlist name').setRequired(true)))
  .addSubcommand((s) => s.setName('delete').setDescription('Delete a playlist').addStringOption((o) => o.setName('name').setDescription('Playlist name').setRequired(true)))
  .addSubcommand((s) => s.setName('list').setDescription('View all your playlists'))
  .addSubcommand((s) => s.setName('view').setDescription('View tracks in a playlist').addStringOption((o) => o.setName('name').setDescription('Playlist name').setRequired(true)))
  .addSubcommand((s) => s.setName('add').setDescription('Add current track to a playlist').addStringOption((o) => o.setName('name').setDescription('Playlist name').setRequired(true)))
  .addSubcommand((s) => s.setName('remove').setDescription('Remove a track from a playlist').addStringOption((o) => o.setName('name').setDescription('Playlist name').setRequired(true)).addIntegerOption((o) => o.setName('position').setDescription('Track position').setMinValue(1).setRequired(true)))
  .addSubcommand((s) => s.setName('play').setDescription('Play a saved playlist').addStringOption((o) => o.setName('name').setDescription('Playlist name').setRequired(true)));

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  const userId = interaction.user.id;
  if (sub === 'create') {
    const name = interaction.options.getString('name');
    const pl = UserPlaylists.create(userId, name);
    if (!pl) return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Playlist **${name}** already exists!`)], ephemeral: true });
    return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription(`✅ Created playlist **${name}**!`)] });
  }
  if (sub === 'delete') {
    const name = interaction.options.getString('name');
    const ok = UserPlaylists.delete(userId, name);
    if (!ok) return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Playlist **${name}** not found!`)], ephemeral: true });
    return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription(`🗑️ Deleted playlist **${name}**!`)] });
  }
  if (sub === 'list') {
    const playlists = UserPlaylists.getAll(userId);
    const names = Object.keys(playlists);
    if (!names.length) return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.warning).setDescription('📂 You have no saved playlists. Use `/playlist create` to make one!')], ephemeral: true });
    const embed = new EmbedBuilder().setColor(COLORS.primary).setTitle('📂 Your Playlists')
      .setDescription(names.map((n, i) => `\`${i + 1}.\` **${n}** — ${playlists[n].tracks.length} tracks`).join('\n'))
      .setFooter({ text: `${names.length} playlist(s)` });
    return interaction.reply({ embeds: [embed] });
  }
  if (sub === 'view') {
    const name = interaction.options.getString('name');
    const pl = UserPlaylists.get(userId, name);
    if (!pl) return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Playlist **${name}** not found!`)], ephemeral: true });
    const desc = pl.tracks.length ? pl.tracks.map((t, i) => `\`${i + 1}.\` **${truncate(t.title, 55)}** \`${formatDuration(t.duration)}\``).join('\n') : '*No tracks yet.*';
    const embed = new EmbedBuilder().setColor(COLORS.primary).setTitle(`📂 Playlist: ${name}`).setDescription(desc).setFooter({ text: `${pl.tracks.length} tracks` });
    return interaction.reply({ embeds: [embed] });
  }
  if (sub === 'add') {
    const name = interaction.options.getString('name');
    const player = interaction.client.lavalink.getPlayer(interaction.guildId);
    if (!player?.queue?.current) return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Nothing is currently playing!')], ephemeral: true });
    const ok = UserPlaylists.addTrack(userId, name, player.queue.current);
    if (!ok) return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Playlist **${name}** not found!`)], ephemeral: true });
    return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription(`✅ Added **${truncate(player.queue.current.info.title, 60)}** to **${name}**!`)] });
  }
  if (sub === 'remove') {
    const name = interaction.options.getString('name');
    const pos = interaction.options.getInteger('position');
    const ok = UserPlaylists.removeTrack(userId, name, pos - 1);
    if (!ok) return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Could not remove track. Check playlist name and position.`)], ephemeral: true });
    return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription(`🗑️ Removed track #${pos} from **${name}**!`)] });
  }
  if (sub === 'play') {
    if (!interaction.member.voice.channel) return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Join a voice channel first!')], ephemeral: true });
    const name = interaction.options.getString('name');
    const pl = UserPlaylists.get(userId, name);
    if (!pl || !pl.tracks.length) return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Playlist **${name}** is empty or not found!`)], ephemeral: true });
    await interaction.deferReply();
    const lavalink = interaction.client.lavalink;
    const settings = GuildSettings.get(interaction.guildId);
    let player = lavalink.getPlayer(interaction.guildId);
    if (!player) {
      player = lavalink.createPlayer({ guildId: interaction.guildId, voiceChannelId: interaction.member.voice.channel.id, textChannelId: interaction.channelId, selfDeaf: true, volume: settings.volume });
      player.customData = new PlayerData();
    }
    if (!player.connected) await player.connect();
    // Search and add each track
    let added = 0;
    for (const t of pl.tracks) {
      try {
        const res = await player.search({ query: t.uri || t.title, source: 'ytsearch' }, interaction.user);
        if (res?.tracks?.length) { await player.queue.add(res.tracks[0]); added++; }
      } catch {}
    }
    if (!player.playing && !player.paused) await player.play();
    await interaction.editReply({ embeds: [new EmbedBuilder().setColor(COLORS.success).setTitle('📂 Playlist Loaded').setDescription(`Added **${added}/${pl.tracks.length}** tracks from **${name}** to queue!`)] });
  }
}
