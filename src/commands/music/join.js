import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';
import { GuildSettings } from '../../database/GuildSettings.js';
import { PlayerData } from '../../structures/Player.js';
export const voiceOnly = true; export const cooldown = 3;
export const data = new SlashCommandBuilder().setName('join').setDescription('Invite the bot to your voice channel');
export async function execute(interaction) {
  const vc = interaction.member.voice.channel;
  if (!vc) return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Join a voice channel first!')], ephemeral: true });
  const lavalink = interaction.client.lavalink;
  let player = lavalink.getPlayer(interaction.guildId);
  if (player && player.voiceChannelId === vc.id) return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.warning).setDescription('⚠️ Already in your voice channel!')], ephemeral: true });
  const settings = GuildSettings.get(interaction.guildId);
  if (!player) {
    player = lavalink.createPlayer({ guildId: interaction.guildId, voiceChannelId: vc.id, textChannelId: interaction.channelId, selfDeaf: true, volume: settings.volume });
    player.customData = new PlayerData();
  } else {
    player.voiceChannelId = vc.id;
  }
  await player.connect();
  await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription(`✅ Joined **${vc.name}**!`)] });
}
