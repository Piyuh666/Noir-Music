import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';
import { GuildSettings } from '../../database/GuildSettings.js';

export const voiceOnly = true;
export const djOnly = true;
export const cooldown = 3;

export const data = new SlashCommandBuilder()
  .setName('247')
  .setDescription('Toggle 24/7 mode — keeps bot stationed in voice channel (DJ only)');

export async function execute(interaction) {
  const lavalink = interaction.client.lavalink;
  let player = lavalink.getPlayer(interaction.guildId);

  if (!player) {
    const vc = interaction.member.voice.channel;
    if (!vc) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Join a voice channel first to activate 24/7 mode!')],
        ephemeral: true,
      });
    }
    const settings = GuildSettings.get(interaction.guildId);
    player = lavalink.createPlayer({
      guildId: interaction.guildId,
      voiceChannelId: vc.id,
      textChannelId: interaction.channelId,
      selfDeaf: true,
      volume: settings.volume,
    });
  }

  if (!player.customData) player.customData = {};
  player.customData.twentyFourSeven = !player.customData.twentyFourSeven;
  GuildSettings.setField(interaction.guildId, 'twentyFourSeven', player.customData.twentyFourSeven);

  if (!player.connected && player.voiceChannelId) {
    await player.connect().catch(() => {});
  }

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(player.customData.twentyFourSeven ? COLORS.success : COLORS.warning)
        .setDescription(
          `🌐 **24/7 Mode is now ${player.customData.twentyFourSeven ? 'ENABLED' : 'DISABLED'}!**\n` +
          `${player.customData.twentyFourSeven ? 'The bot will remain connected even when the queue finishes.' : 'The bot will disconnect when the queue ends.'}`
        )
    ]
  });
}
