import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';
import { parseTime, formatDuration } from '../../utils/helpers.js';

export const voiceOnly = true;
export const playerRequired = true;
export const djOnly = true;
export const cooldown = 3;

export const data = new SlashCommandBuilder()
  .setName('seek')
  .setDescription('Seek to a position in the current track (DJ only)')
  .addStringOption((o) => o.setName('position').setDescription('Position (e.g. 1:30, 90)').setRequired(true));

export async function execute(interaction) {
  const player = interaction.client.lavalink.getPlayer(interaction.guildId);
  const track = player?.queue?.current;
  if (!track) return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Nothing playing!')], ephemeral: true });
  if (track.info.isStream) return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Cannot seek in a live stream!')], ephemeral: true });
  const posStr = interaction.options.getString('position');
  const ms = parseTime(posStr);
  if (!ms || ms < 0) return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Invalid time format! Use `mm:ss` or seconds.')], ephemeral: true });
  if (ms > track.info.duration) return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Position exceeds track duration (${formatDuration(track.info.duration)})`)], ephemeral: true });
  await player.seek(ms);
  await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription(`⏩ Seeked to **${formatDuration(ms)}** / **${formatDuration(track.info.duration)}**`)] });
}
