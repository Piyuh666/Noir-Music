import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';

export const voiceOnly = true;
export const playerRequired = true;
export const djOnly = true;
export const cooldown = 3;

export const data = new SlashCommandBuilder()
  .setName('tremolo')
  .setDescription('Toggle tremolo audio oscillation effect (DJ only)');

export async function execute(interaction) {
  const player = interaction.client.lavalink.getPlayer(interaction.guildId);
  try {
    await player.filterManager.toggleTremolo();
    const isTremolo = player.filterManager.filters.tremolo;
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(isTremolo ? COLORS.success : COLORS.warning)
          .setDescription(`〰️ Tremolo effect **${isTremolo ? 'enabled' : 'disabled'}**!`)
      ]
    });
  } catch (err) {
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`⚠️ Error: ${err.message}`)],
      ephemeral: true,
    });
  }
}
