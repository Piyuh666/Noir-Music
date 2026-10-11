import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';
import { truncate } from '../../utils/helpers.js';

export const voiceOnly = true;
export const playerRequired = true;
export const djOnly = true;
export const cooldown = 3;

export const data = new SlashCommandBuilder()
  .setName('skipto')
  .setDescription('Skip directly to a specific track position in the queue (DJ only)')
  .addIntegerOption((o) =>
    o.setName('position')
      .setDescription('Queue position to skip to')
      .setMinValue(1)
      .setRequired(true)
  );

export async function execute(interaction) {
  const player = interaction.client.lavalink.getPlayer(interaction.guildId);
  const pos = interaction.options.getInteger('position');

  if (pos > player.queue.tracks.length) {
    return interaction.reply({
      embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Position out of range! Queue only has **${player.queue.tracks.length}** tracks.`)],
      ephemeral: true,
    });
  }

  const track = player.queue.tracks[pos - 1];
  await player.skip(pos);

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(COLORS.success)
        .setDescription(`⏭️ Skipped forward to **#${pos}**: [${truncate(track.info.title, 60)}](${track.info.uri})`)
    ]
  });
}
