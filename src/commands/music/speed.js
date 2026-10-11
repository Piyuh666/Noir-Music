import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';

export const voiceOnly = true;
export const playerRequired = true;
export const djOnly = true;
export const cooldown = 3;

export const data = new SlashCommandBuilder()
  .setName('speed')
  .setDescription('Set audio playback speed (DJ only)')
  .addNumberOption((o) =>
    o.setName('rate')
      .setDescription('Playback speed rate (0.5 - 2.0)')
      .setMinValue(0.5)
      .setMaxValue(2.0)
      .setRequired(true)
  );

export async function execute(interaction) {
  const player = interaction.client.lavalink.getPlayer(interaction.guildId);
  const rate = interaction.options.getNumber('rate');

  try {
    await player.filterManager.setSpeed(rate);
    const icon = rate > 1 ? '⏩' : rate < 1 ? '⏪' : '▶️';
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(COLORS.success)
          .setDescription(`${icon} Playback speed set to **${rate}x**!`)
      ]
    });
  } catch (err) {
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`⚠️ Error setting speed: ${err.message}`)],
      ephemeral: true,
    });
  }
}
