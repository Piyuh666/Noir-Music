import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';

export const voiceOnly = true;
export const djOnly = true;
export const cooldown = 5;

export const data = new SlashCommandBuilder().setName('clear').setDescription('Clear all tracks from the queue (DJ only)');

export async function execute(interaction) {
  const player = interaction.client.lavalink.getPlayer(interaction.guildId);
  if (!player || player.queue.tracks.length === 0) return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ The queue is already empty!')], ephemeral: true });
  const count = player.queue.tracks.length;
  player.queue.tracks.splice(0);
  await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription(`🗑️ Cleared **${count}** tracks from the queue.`)] });
}
