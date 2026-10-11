import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';

export const voiceOnly = true;
export const playerRequired = true;
export const djOnly = true;
export const cooldown = 2;

export const data = new SlashCommandBuilder()
  .setName('voldown')
  .setDescription('Quickly decrease playback volume by 10%');

export async function execute(interaction) {
  const player = interaction.client.lavalink.getPlayer(interaction.guildId);
  const newVol = Math.max(1, (player.volume || 80) - 10);
  await player.setVolume(newVol);

  await interaction.reply({ 
    embeds: [new EmbedBuilder().setColor(COLORS.primary).setDescription(`🔉 Volume decreased to **${newVol}%**`)] 
  });
}
