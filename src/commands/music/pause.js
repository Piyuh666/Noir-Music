import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';

export const voiceOnly = true;
export const playerRequired = true;
export const cooldown = 2;

export const data = new SlashCommandBuilder().setName('pause').setDescription('Pause the currently playing track');

export async function execute(interaction) {
  const player = interaction.client.lavalink.getPlayer(interaction.guildId);
  if (player.paused) return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.warning).setDescription('⚠️ Already paused! Use `/resume`.')], ephemeral: true });
  await player.pause();
  await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.warning).setDescription('⏸️ Paused music playback.')] });
}
