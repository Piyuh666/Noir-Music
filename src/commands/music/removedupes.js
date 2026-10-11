import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';

export const voiceOnly = true;
export const playerRequired = true;
export const djOnly = true;
export const cooldown = 3;

export const data = new SlashCommandBuilder()
  .setName('removedupes')
  .setDescription('Scan and remove all duplicate songs from the queue');

export async function execute(interaction) {
  const player = interaction.client.lavalink.getPlayer(interaction.guildId);

  if (player.queue.tracks.length < 2) {
    return interaction.reply({ 
      embeds: [new EmbedBuilder().setColor(COLORS.warning).setDescription('⚠️ Not enough tracks in queue to check for duplicates.')], 
      ephemeral: true 
    });
  }

  const initialCount = player.queue.tracks.length;
  const seenUrls = new Set();
  const filtered = [];

  for (const track of player.queue.tracks) {
    const key = track.info.uri || track.info.identifier;
    if (!seenUrls.has(key)) {
      seenUrls.add(key);
      filtered.push(track);
    }
  }

  const removedCount = initialCount - filtered.length;
  player.queue.tracks = filtered;

  if (removedCount === 0) {
    return interaction.reply({ 
      embeds: [new EmbedBuilder().setColor(COLORS.primary).setDescription('✅ No duplicate songs found in the queue.')] 
    });
  }

  await interaction.reply({ 
    embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription(`🧹 Cleaned up and removed **${removedCount} duplicate track(s)** from the queue!`)] 
  });
}
