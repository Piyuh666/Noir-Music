import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';

export const voiceOnly = true;
export const playerRequired = true;
export const djOnly = true;
export const cooldown = 2;

export const data = new SlashCommandBuilder()
  .setName('mute')
  .setDescription('Mute audio playback (sets volume to 0%)');

export async function execute(interaction) {
  const player = interaction.client.lavalink.getPlayer(interaction.guildId);
  player.customData = player.customData || {};
  player.customData.previousVolume = player.volume || 80;

  await player.setVolume(0);

  await interaction.reply({ 
    embeds: [new EmbedBuilder().setColor(COLORS.warning).setDescription('🔇 Audio stream has been **muted**! Use `/unmute` to restore volume.')] 
  });
}
