import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';

export const voiceOnly = true;
export const playerRequired = true;
export const djOnly = true;
export const cooldown = 3;

export const data = new SlashCommandBuilder()
  .setName('swap')
  .setDescription('Swap positions of two tracks in the queue')
  .addIntegerOption((o) => o.setName('track1').setDescription('First track position').setMinValue(1).setRequired(true))
  .addIntegerOption((o) => o.setName('track2').setDescription('Second track position').setMinValue(1).setRequired(true));

export async function execute(interaction) {
  const player = interaction.client.lavalink.getPlayer(interaction.guildId);
  const t1 = interaction.options.getInteger('track1');
  const t2 = interaction.options.getInteger('track2');
  const len = player.queue.tracks.length;

  if (t1 > len || t2 > len) {
    return interaction.reply({ 
      embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Track numbers must be between 1 and ${len}!`)], 
      ephemeral: true 
    });
  }

  if (t1 === t2) {
    return interaction.reply({ 
      embeds: [new EmbedBuilder().setColor(COLORS.warning).setDescription('⚠️ Both track numbers are identical.')], 
      ephemeral: true 
    });
  }

  const temp = player.queue.tracks[t1 - 1];
  player.queue.tracks[t1 - 1] = player.queue.tracks[t2 - 1];
  player.queue.tracks[t2 - 1] = temp;

  await interaction.reply({ 
    embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription(`🔀 Swapped track **#${t1}** with track **#${t2}** successfully!`)] 
  });
}
