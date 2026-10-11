import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';

export const voiceOnly = true;
export const playerRequired = true;
export const cooldown = 2;

export const data = new SlashCommandBuilder().setName('resume').setDescription('Resume paused music playback');

export async function execute(interaction) {
  const player = interaction.client.lavalink.getPlayer(interaction.guildId);
  if (!player.paused) return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.warning).setDescription('⚠️ Playback is not paused!')], ephemeral: true });
  await player.resume();
  await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription('▶️ Resumed music playback.')] });
}
