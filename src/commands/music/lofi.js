import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';

export const voiceOnly = true;
export const playerRequired = true;
export const djOnly = true;
export const cooldown = 3;

export const data = new SlashCommandBuilder()
  .setName('lofi')
  .setDescription('Toggle warm chilled Lo-Fi lowpass audio filter (DJ only)');

export async function execute(interaction) {
  const player = interaction.client.lavalink.getPlayer(interaction.guildId);
  try {
    await player.filterManager.toggleLowPass();
    const isLofi = player.filterManager.filters.lowPass;
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(isLofi ? COLORS.success : COLORS.warning)
          .setDescription(`📻 Lo-Fi warm low-pass filter **${isLofi ? 'enabled' : 'disabled'}**!`)
      ]
    });
  } catch (err) {
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`⚠️ Error: ${err.message}`)],
      ephemeral: true
    });
  }
}
