import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';
import { truncate } from '../../utils/helpers.js';

export const voiceOnly = true;
export const djOnly = true;
export const cooldown = 3;

export const data = new SlashCommandBuilder()
  .setName('move')
  .setDescription('Move a track to a different queue position (DJ only)')
  .addIntegerOption((o) => o.setName('from').setDescription('Current position of the track').setMinValue(1).setRequired(true))
  .addIntegerOption((o) => o.setName('to').setDescription('New position for the track').setMinValue(1).setRequired(true));

export async function execute(interaction) {
  const player = interaction.client.lavalink.getPlayer(interaction.guildId);
  if (!player || player.queue.tracks.length < 2) return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Need at least 2 tracks in queue!')], ephemeral: true });
  const from = interaction.options.getInteger('from');
  const to = interaction.options.getInteger('to');
  const len = player.queue.tracks.length;
  if (from > len || to > len) return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Positions must be between 1 and ${len}!`)], ephemeral: true });
  if (from === to) return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.warning).setDescription('⚠️ Track is already at that position.')], ephemeral: true });
  const [track] = player.queue.tracks.splice(from - 1, 1);
  player.queue.tracks.splice(to - 1, 0, track);
  await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription(`📌 Moved **[${truncate(track.info.title, 60)}](${track.info.uri})** from position **#${from}** to **#${to}**`)] });
}
