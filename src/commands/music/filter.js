import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS, FILTERS } from '../../config.js';

export const voiceOnly = true;
export const playerRequired = true;
export const djOnly = true;
export const cooldown = 3;

export const data = new SlashCommandBuilder()
  .setName('filter')
  .setDescription('Apply or remove audio filters (DJ only)')
  .addStringOption((o) =>
    o.setName('name')
      .setDescription('Filter to apply (or "off" to reset)')
      .setRequired(true)
      .addChoices(
        { name: '🔴 Off (Reset)', value: 'off' },
        { name: '🎸 Bass Boost', value: 'bassboost' },
        { name: '🌙 Nightcore', value: 'nightcore' },
        { name: '🌊 Vaporwave', value: 'vaporwave' },
        { name: '🎧 8D Audio', value: '8d' },
        { name: '🎤 Karaoke', value: 'karaoke' },
        { name: '〰️ Tremolo', value: 'tremolo' },
        { name: '🌀 Vibrato', value: 'vibrato' },
        { name: '📻 Lo-Fi', value: 'lofi' },
      )
  );

export async function execute(interaction) {
  const player = interaction.client.lavalink.getPlayer(interaction.guildId);
  if (!player) {
    return interaction.reply({
      embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ No active player found!')],
      ephemeral: true,
    });
  }

  const name = interaction.options.getString('name');
  await interaction.deferReply();

  try {
    if (name === 'off') {
      await player.filterManager.resetFilters();
      return interaction.editReply({
        embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription('🎛️ All audio filters have been **reset**.')]
      });
    }

    if (name === 'nightcore') {
      await player.filterManager.toggleNightcore();
      return interaction.editReply({
        embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription('🌙 Nightcore filter toggled!')]
      });
    }

    if (name === 'vaporwave') {
      await player.filterManager.toggleVaporwave();
      return interaction.editReply({
        embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription('🌊 Vaporwave filter toggled!')]
      });
    }

    if (name === 'karaoke') {
      await player.filterManager.toggleKaraoke();
      return interaction.editReply({
        embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription('🎤 Karaoke vocal reduction toggled!')]
      });
    }

    if (name === '8d') {
      await player.filterManager.toggleRotation();
      return interaction.editReply({
        embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription('🎧 8D rotating audio filter toggled!')]
      });
    }

    if (name === 'tremolo') {
      await player.filterManager.toggleTremolo();
      return interaction.editReply({
        embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription('〰️ Tremolo effect toggled!')]
      });
    }

    if (name === 'vibrato') {
      await player.filterManager.toggleVibrato();
      return interaction.editReply({
        embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription('🌀 Vibrato effect toggled!')]
      });
    }

    if (name === 'lofi') {
      await player.filterManager.toggleLowPass();
      return interaction.editReply({
        embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription('📻 Lo-Fi warm filter toggled!')]
      });
    }

    if (name === 'bassboost') {
      await player.filterManager.setEQ([
        { band: 0, gain: 0.65 },
        { band: 1, gain: 0.70 },
        { band: 2, gain: 0.50 },
        { band: 3, gain: 0.30 },
      ]);
      return interaction.editReply({
        embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription('🎸 Bass Boost filter applied!')]
      });
    }

    await interaction.editReply({
      embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Unknown filter selected!')]
    });
  } catch (err) {
    await interaction.editReply({
      embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`⚠️ Failed to toggle filter: ${err.message}`)]
    });
  }
}
