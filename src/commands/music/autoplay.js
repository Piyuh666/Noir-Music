import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';
import { GuildSettings } from '../../database/GuildSettings.js';

export const voiceOnly = true;
export const djOnly = true;
export const cooldown = 3;

export const data = new SlashCommandBuilder()
  .setName('autoplay')
  .setDescription('Toggle intelligent autoplay of related tracks when queue ends (DJ only)');

export async function execute(interaction) {
  const lavalink = interaction.client.lavalink;
  let player = lavalink.getPlayer(interaction.guildId);

  if (!player) {
    return interaction.reply({
      embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ No active player in this server!')],
      ephemeral: true,
    });
  }

  if (!player.customData) player.customData = {};
  player.customData.autoplay = !player.customData.autoplay;
  GuildSettings.setField(interaction.guildId, 'autoplay', player.customData.autoplay);

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(player.customData.autoplay ? COLORS.success : COLORS.warning)
        .setDescription(
          `♾️ **Autoplay is now ${player.customData.autoplay ? 'ENABLED' : 'DISABLED'}!**\n` +
          `${player.customData.autoplay ? 'Related songs will automatically be queued when playback completes.' : 'Playback will stop when the queue is finished.'}`
        )
    ]
  });
}
