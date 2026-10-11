import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { COLORS } from '../../config.js';
import { formatDuration, truncate } from '../../utils/helpers.js';
import { GuildSettings } from '../../database/GuildSettings.js';
import { PlayerData } from '../../structures/Player.js';
import { PermissionsBitField } from 'discord.js';

export const voiceOnly = true;
export const cooldown = 5;

export const data = new SlashCommandBuilder()
  .setName('search')
  .setDescription('Search for songs and pick from a list')
  .addStringOption((o) => o.setName('query').setDescription('Search query').setRequired(true))
  .addStringOption((o) =>
    o.setName('platform').setDescription('Search platform').addChoices(
      { name: 'YouTube', value: 'ytsearch' },
      { name: 'YouTube Music', value: 'ytmsearch' },
      { name: 'SoundCloud', value: 'scsearch' },
    ).setRequired(false)
  );

export async function execute(interaction) {
  const voiceChannel = interaction.member.voice.channel;
  if (!voiceChannel) return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ You must be in a voice channel!')], ephemeral: true });
  const query = interaction.options.getString('query');
  const platform = interaction.options.getString('platform') || 'ytsearch';
  await interaction.deferReply();
  const lavalink = interaction.client.lavalink;
  try {
    const res = await lavalink.search({ query, source: platform }, interaction.user);
    if (!res || !res.tracks?.length) return interaction.editReply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ No results found!')] });
    const tracks = res.tracks.slice(0, 10);
    const embed = new EmbedBuilder().setColor(COLORS.primary)
      .setTitle(`🔍 Search Results for: ${truncate(query, 40)}`)
      .setDescription(tracks.map((t, i) => `\`${i + 1}.\` [${truncate(t.info.title, 55)}](${t.info.uri}) \`${formatDuration(t.info.duration)}\``).join('\n'))
      .setFooter({ text: 'Select a track from the dropdown below' });
    const menu = new StringSelectMenuBuilder()
      .setCustomId('search_select')
      .setPlaceholder('Choose a track to play...')
      .addOptions(tracks.map((t, i) => ({ label: truncate(`${i + 1}. ${t.info.title}`, 100), description: truncate(t.info.author, 100), value: t.info.uri || t.info.identifier, emoji: '🎵' })));
    const row = new ActionRowBuilder().addComponents(menu);
    const msg = await interaction.editReply({ embeds: [embed], components: [row] });
    const collector = msg.createMessageComponentCollector({ filter: (i) => i.user.id === interaction.user.id, time: 30000, max: 1 });
    collector.on('collect', async (i) => {
      const selected = i.values[0];
      const track = tracks.find((t) => (t.info.uri || t.info.identifier) === selected);
      if (!track) return i.update({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Track not found.')], components: [] });
      const settings = GuildSettings.get(interaction.guildId);
      let player = lavalink.getPlayer(interaction.guildId);
      if (!player) {
        player = lavalink.createPlayer({ guildId: interaction.guildId, voiceChannelId: voiceChannel.id, textChannelId: interaction.channelId, selfDeaf: true, volume: settings.volume });
        player.customData = new PlayerData();
      }
      if (!player.connected) await player.connect();
      await player.queue.add(track);
      if (!player.playing && !player.paused) await player.play();
      await i.update({ embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription(`✅ Added **[${truncate(track.info.title, 60)}](${track.info.uri})** to queue!`)], components: [] });
    });
    collector.on('end', (_, reason) => { if (reason === 'time') msg.edit({ components: [] }).catch(() => {}); });
  } catch (err) {
    await interaction.editReply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`⚠️ Search failed: ${err.message}`)] });
  }
}
