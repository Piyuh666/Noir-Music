import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';
import { GuildSettings } from '../../database/GuildSettings.js';

export const voiceOnly = true;
export const djOnly = true;
export const cooldown = 2;

export const data = new SlashCommandBuilder().setName('volume').setDescription('Set or view the player volume (DJ only)')
  .addIntegerOption((o) => o.setName('level').setDescription('Volume level (1-150)').setMinValue(1).setMaxValue(150).setRequired(false));

export async function execute(interaction) {
  const player = interaction.client.lavalink.getPlayer(interaction.guildId);
  if (!player) return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ No active player!')], ephemeral: true });
  const level = interaction.options.getInteger('level');
  if (!level) {
    return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.primary).setDescription(`🔊 Current volume: **${player.volume}%**`)] });
  }
  await player.setVolume(level);
  GuildSettings.setField(interaction.guildId, 'volume', level);
  const bar = level <= 33 ? '🔈' : level <= 66 ? '🔉' : '🔊';
  await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription(`${bar} Volume set to **${level}%**`)] });
}
