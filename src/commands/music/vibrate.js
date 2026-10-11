import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';

export const voiceOnly = true;
export const playerRequired = true;
export const djOnly = true;
export const cooldown = 3;

export const data = new SlashCommandBuilder()
  .setName('vibrate')
  .setDescription('Toggle vibrating audio pitch effect (DJ only)');

export async function execute(interaction) {
  const player = interaction.client.lavalink.getPlayer(interaction.guildId);
  try {
    await player.filterManager.toggleVibrato();
    const isVibrato = player.filterManager.filters.vibrato;
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(isVibrato ? COLORS.success : COLORS.warning)
          .setDescription(`〰️ Vibrato effect **${isVibrato ? 'enabled' : 'disabled'}**!`)
      ]
    });
  } catch (err) {
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`⚠️ Error: ${err.message}`)],
      ephemeral: true,
    });
  }
}
