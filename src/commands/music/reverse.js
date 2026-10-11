import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';

export const voiceOnly = true;
export const playerRequired = true;
export const djOnly = true;
export const cooldown = 3;

export const data = new SlashCommandBuilder()
  .setName('reverse')
  .setDescription('Reverse the entire order of upcoming tracks in the queue');

export async function execute(interaction) {
  const player = interaction.client.lavalink.getPlayer(interaction.guildId);

  if (player.queue.tracks.length < 2) {
    return interaction.reply({ 
      embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Need at least 2 tracks in the queue to reverse order!')], 
      ephemeral: true 
    });
  }

  player.queue.tracks.reverse();

  await interaction.reply({ 
    embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription(`🔄 Reversed the order of **${player.queue.tracks.length}** tracks in the queue!`)] 
  });
}
