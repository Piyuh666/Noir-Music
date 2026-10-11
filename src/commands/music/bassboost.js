import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';

export const voiceOnly = true;
export const playerRequired = true;
export const djOnly = true;
export const cooldown = 3;

export const data = new SlashCommandBuilder()
  .setName('bassboost')
  .setDescription('Quick bass boost equalizer toggle (DJ only)')
  .addStringOption((o) =>
    o.setName('level')
      .setDescription('Boost intensity level')
      .setRequired(false)
      .addChoices(
        { name: 'Off', value: 'off' },
        { name: 'Low', value: 'low' },
        { name: 'Medium', value: 'medium' },
        { name: 'High', value: 'high' },
        { name: 'Extreme', value: 'extreme' },
      )
  );

export async function execute(interaction) {
  const player = interaction.client.lavalink.getPlayer(interaction.guildId);
  const level = interaction.options.getString('level') || 'medium';

  const presets = {
    off: [],
    low: [
      { band: 0, gain: 0.20 },
      { band: 1, gain: 0.25 },
    ],
    medium: [
      { band: 0, gain: 0.50 },
      { band: 1, gain: 0.55 },
      { band: 2, gain: 0.30 },
    ],
    high: [
      { band: 0, gain: 0.75 },
      { band: 1, gain: 0.80 },
      { band: 2, gain: 0.50 },
      { band: 3, gain: 0.35 },
    ],
    extreme: [
      { band: 0, gain: 1.00 },
      { band: 1, gain: 1.00 },
      { band: 2, gain: 0.75 },
      { band: 3, gain: 0.60 },
    ],
  };

  try {
    if (level === 'off') {
      await player.filterManager.clearEQ();
    } else {
      await player.filterManager.setEQ(presets[level]);
    }

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(COLORS.success)
          .setDescription(`🎸 Bass Boost profile set to **${level.toUpperCase()}**!`)
      ]
    });
  } catch (err) {
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`⚠️ Error setting EQ: ${err.message}`)],
      ephemeral: true,
    });
  }
}
