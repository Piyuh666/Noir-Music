import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';

export const voiceOnly = true;
export const playerRequired = true;
export const djOnly = true;
export const cooldown = 3;

export const data = new SlashCommandBuilder().setName('shuffle').setDescription('Shuffle the current queue (DJ only)');

export async function execute(interaction) {
  const player = interaction.client.lavalink.getPlayer(interaction.guildId);
  if (player.queue.tracks.length < 2) return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Need at least 2 tracks to shuffle!')], ephemeral: true });
  await player.queue.shuffle();
  await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription(`🔀 Shuffled **${player.queue.tracks.length}** tracks in queue!`)] });
}
