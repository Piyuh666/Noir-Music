import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';
export const voiceOnly = true; export const djOnly = true; export const cooldown = 3;
export const data = new SlashCommandBuilder().setName('leave').setDescription('Disconnect the bot from voice channel (DJ only)');
export async function execute(interaction) {
  const player = interaction.client.lavalink.getPlayer(interaction.guildId);
  if (!player) return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Bot is not in a voice channel!')], ephemeral: true });
  const vc = interaction.guild.channels.cache.get(player.voiceChannelId);
  await player.destroy('Command: leave');
  await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription(`✅ Left **${vc?.name || 'voice channel'}**!`)] });
}
