import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';
export const voiceOnly = true; export const playerRequired = true; export const djOnly = true; export const cooldown = 5;
export const data = new SlashCommandBuilder().setName('replay').setDescription('Replay the current track from the beginning (DJ only)');
export async function execute(interaction) {
  const player = interaction.client.lavalink.getPlayer(interaction.guildId);
  await player.seek(0);
  await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription('🔄 Replaying current track from the beginning!')] });
}
