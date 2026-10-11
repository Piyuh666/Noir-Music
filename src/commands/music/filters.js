import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';

export const voiceOnly = true;
export const playerRequired = true;
export const djOnly = true;
export const cooldown = 3;

export const data = new SlashCommandBuilder()
  .setName('filters')
  .setDescription('View all active audio filters or reset them to default');

export async function execute(interaction) {
  const player = interaction.client.lavalink.getPlayer(interaction.guildId);
  const filters = player.filterManager.filters || {};

  const activeFilters = [];
  if (filters.custom) activeFilters.push('Custom Equalizer Profile');
  if (filters.nightcore) activeFilters.push('Nightcore (1.29x)');
  if (filters.vaporwave) activeFilters.push('Vaporwave (0.85x)');
  if (filters.rotation) activeFilters.push('8D Audio');
  if (filters.karaoke) activeFilters.push('Karaoke');
  if (filters.tremolo) activeFilters.push('Tremolo');
  if (filters.vibrato) activeFilters.push('Vibrato');
  if (filters.lowPass) activeFilters.push('Lo-Fi / LowPass');
  if (filters.volume) activeFilters.push('Software Volume Boost');

  const desc = activeFilters.length
    ? `**Currently Active Filters:**\n${activeFilters.map((f) => `• \`${f}\``).join('\n')}\n\n*Use \`/filter off\` to clear all filters.*`
    : 'No audio filters currently active. Default profile.';

  const embed = new EmbedBuilder()
    .setColor(COLORS.primary)
    .setTitle('🎛️ Audio DSP Filters Status')
    .setDescription(desc)
    .setFooter({ text: 'Hardware DSP Equalizer' });

  await interaction.reply({ embeds: [embed] });
}
