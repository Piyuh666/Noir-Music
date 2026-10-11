import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';

export const voiceOnly = true;
export const playerRequired = true;
export const djOnly = true;
export const cooldown = 3;

export const data = new SlashCommandBuilder()
  .setName('8d')
  .setDescription('Toggle 8D rotating audio filter (DJ only)');

export async function execute(interaction) {
  const player = interaction.client.lavalink.getPlayer(interaction.guildId);
  try {
    await player.filterManager.toggleRotation();
    const is8D = player.filterManager.filters.rotation;
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(is8D ? COLORS.success : COLORS.warning)
          .setDescription(`🎧 8D Audio **${is8D ? 'enabled' : 'disabled'}**! Use headphones for best effect.`)
      ]
    });
  } catch (err) {
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`⚠️ Error: ${err.message}`)],
      ephemeral: true
    });
  }
}
