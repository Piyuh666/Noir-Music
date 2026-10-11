import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';
import { truncate } from '../../utils/helpers.js';

export const voiceOnly = true;
export const playerRequired = true;
export const djOnly = true;
export const cooldown = 3;

export const data = new SlashCommandBuilder()
  .setName('previous')
  .setDescription('Play the previous track (DJ only)');

export async function execute(interaction) {
  const player = interaction.client.lavalink.getPlayer(interaction.guildId);
  const prevTrack = await player.queue.shiftPrevious();

  if (!prevTrack) {
    return interaction.reply({
      embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ No previous track found in history!')],
      ephemeral: true,
    });
  }

  await player.play({ clientTrack: prevTrack });

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(COLORS.success)
        .setDescription(`⏮️ Replaying previous track: **[${truncate(prevTrack.info.title, 60)}](${prevTrack.info.uri})**`)
    ]
  });
}
