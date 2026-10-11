import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';

export const voiceOnly = true;
export const playerRequired = true;
export const djOnly = true;
export const cooldown = 2;

export const data = new SlashCommandBuilder()
  .setName('unmute')
  .setDescription('Unmute audio playback (restores previous volume)');

export async function execute(interaction) {
  const player = interaction.client.lavalink.getPlayer(interaction.guildId);
  const targetVol = player.customData?.previousVolume || 80;

  await player.setVolume(targetVol);

  await interaction.reply({ 
    embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription(`🔊 Audio stream **unmuted**! Volume restored to **${targetVol}%**.`)] 
  });
}
