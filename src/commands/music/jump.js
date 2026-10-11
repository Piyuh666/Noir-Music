import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';

export const voiceOnly = true;
export const playerRequired = true;
export const djOnly = true;
export const cooldown = 3;

export const data = new SlashCommandBuilder()
  .setName('jump')
  .setDescription('Jump forward to a specific track in the queue, skipping previous songs')
  .addIntegerOption((o) => o.setName('position').setDescription('Queue track number to jump to').setMinValue(1).setRequired(true));

export async function execute(interaction) {
  const player = interaction.client.lavalink.getPlayer(interaction.guildId);
  const pos = interaction.options.getInteger('position');

  if (pos > player.queue.tracks.length) {
    return interaction.reply({ 
      embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Position out of range! Queue only has **${player.queue.tracks.length}** songs.`)], 
      ephemeral: true 
    });
  }

  const targetTrack = player.queue.tracks[pos - 1];
  await player.skip(pos);

  await interaction.reply({ 
    embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription(`⏭️ Jumped to track **#${pos}**: **${targetTrack.info.title}**`)] 
  });
}
