import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';
import { hasDJPermission } from '../../systems/DJSystem.js';

export const voiceOnly = true;
export const cooldown = 3;

export const data = new SlashCommandBuilder().setName('stop').setDescription('Stop playback, clear queue, and leave voice channel');

export async function execute(interaction) {
  const player = interaction.client.lavalink.getPlayer(interaction.guildId);
  if (!player) return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ No active player!')], ephemeral: true });
  if (player.voiceChannelId !== interaction.member.voice.channel?.id) return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Join the bot\'s voice channel!')], ephemeral: true });
  const isDJ = await hasDJPermission(interaction, player);
  if (!isDJ) return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ You need DJ permission to stop playback!')], ephemeral: true });
  await player.destroy('Command: stop');
  await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.warning).setDescription('⏹️ Stopped playback, cleared the queue, and disconnected.')] });
}
