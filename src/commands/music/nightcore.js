import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';

export const voiceOnly = true;
export const playerRequired = true;
export const djOnly = true;
export const cooldown = 3;

export const data = new SlashCommandBuilder()
  .setName('nightcore')
  .setDescription('Toggle Nightcore filter (DJ only)');

export async function execute(interaction) {
  const player = interaction.client.lavalink.getPlayer(interaction.guildId);
  try {
    await player.filterManager.toggleNightcore();
    const isNightcore = player.filterManager.filters.nightcore;
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(isNightcore ? COLORS.success : COLORS.warning)
          .setDescription(`🌙 Nightcore filter **${isNightcore ? 'enabled' : 'disabled'}**!`)
      ]
    });
  } catch (err) {
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`⚠️ Error: ${err.message}`)],
      ephemeral: true
    });
  }
}
