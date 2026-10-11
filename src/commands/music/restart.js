import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';

export const voiceOnly = true;
export const playerRequired = true;
export const djOnly = true;
export const cooldown = 3;

export const data = new SlashCommandBuilder()
  .setName('restart')
  .setDescription('Restart the current track from 00:00');

export async function execute(interaction) {
  const player = interaction.client.lavalink.getPlayer(interaction.guildId);
  await player.seek(0);

  await interaction.reply({ 
    embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription('🔄 Restarted the current song from the beginning!')] 
  });
}
