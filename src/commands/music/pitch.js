import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';

export const voiceOnly = true;
export const playerRequired = true;
export const djOnly = true;
export const cooldown = 3;

export const data = new SlashCommandBuilder()
  .setName('pitch')
  .setDescription('Set audio pitch (DJ only)')
  .addNumberOption((o) =>
    o.setName('value')
      .setDescription('Pitch multiplier (0.5 - 2.0)')
      .setMinValue(0.5)
      .setMaxValue(2.0)
      .setRequired(true)
  );

export async function execute(interaction) {
  const player = interaction.client.lavalink.getPlayer(interaction.guildId);
  const pitch = interaction.options.getNumber('value');

  try {
    await player.filterManager.setPitch(pitch);
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(COLORS.success)
          .setDescription(`🎵 Pitch multiplier set to **${pitch}x**!`)
      ]
    });
  } catch (err) {
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`⚠️ Error setting pitch: ${err.message}`)],
      ephemeral: true,
    });
  }
}
