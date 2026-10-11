import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';

export const voiceOnly = true;
export const playerRequired = true;
export const djOnly = true;
export const cooldown = 3;

export const data = new SlashCommandBuilder()
  .setName('forward')
  .setDescription('Fast forward playback by a specified number of seconds')
  .addIntegerOption((o) => o.setName('seconds').setDescription('Seconds to fast-forward (1-300)').setMinValue(1).setMaxValue(300).setRequired(true));

export async function execute(interaction) {
  const player = interaction.client.lavalink.getPlayer(interaction.guildId);
  const track = player.queue.current;

  if (track.info.isStream) {
    return interaction.reply({ 
      embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Cannot fast-forward in a live audio stream!')], 
      ephemeral: true 
    });
  }

  const seconds = interaction.options.getInteger('seconds');
  const targetPos = Math.min(track.info.duration - 1000, (player.position || 0) + seconds * 1000);

  await player.seek(targetPos);

  await interaction.reply({ 
    embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription(`⏩ Fast forwarded playback by **${seconds}s**!`)] 
  });
}
