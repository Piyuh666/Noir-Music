import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';

export const voiceOnly = true;
export const playerRequired = true;
export const djOnly = true;
export const cooldown = 3;

export const data = new SlashCommandBuilder()
  .setName('vaporwave')
  .setDescription('Toggle slow dreamy vaporwave audio filter (DJ only)');

export async function execute(interaction) {
  const player = interaction.client.lavalink.getPlayer(interaction.guildId);
  try {
    await player.filterManager.toggleVaporwave();
    const isVaporwave = player.filterManager.filters.vaporwave;
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(isVaporwave ? COLORS.success : COLORS.warning)
          .setDescription(`🌊 Vaporwave filter **${isVaporwave ? 'enabled' : 'disabled'}**!`)
      ]
    });
  } catch (err) {
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`⚠️ Error: ${err.message}`)],
      ephemeral: true
    });
  }
}
