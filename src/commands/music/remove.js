import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';
import { truncate } from '../../utils/helpers.js';

export const voiceOnly = true;
export const djOnly = true;
export const cooldown = 3;

export const data = new SlashCommandBuilder()
  .setName('remove')
  .setDescription('Remove a specific track from the queue by position (DJ only)')
  .addIntegerOption((o) => o.setName('position').setDescription('Position in queue to remove').setMinValue(1).setRequired(true));

export async function execute(interaction) {
  const player = interaction.client.lavalink.getPlayer(interaction.guildId);
  if (!player || player.queue.tracks.length === 0) return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ The queue is empty!')], ephemeral: true });
  const pos = interaction.options.getInteger('position');
  if (pos > player.queue.tracks.length) return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Position out of range! Queue has **${player.queue.tracks.length}** tracks.`)], ephemeral: true });
  const removed = player.queue.tracks[pos - 1];
  player.queue.tracks.splice(pos - 1, 1);
  await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription(`🗑️ Removed **#${pos}**: [${truncate(removed.info.title, 60)}](${removed.info.uri})`)] });
}
