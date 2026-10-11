import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';

export const voiceOnly = true;
export const playerRequired = true;
export const djOnly = true;
export const cooldown = 3;

export const data = new SlashCommandBuilder()
  .setName('karaoke')
  .setDescription('Toggle vocal reduction karaoke filter (DJ only)');

export async function execute(interaction) {
  const player = interaction.client.lavalink.getPlayer(interaction.guildId);
  try {
    await player.filterManager.toggleKaraoke();
    const isKaraoke = player.filterManager.filters.karaoke;
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(isKaraoke ? COLORS.success : COLORS.warning)
          .setDescription(`🎤 Karaoke mode **${isKaraoke ? 'enabled' : 'disabled'}**!`)
      ]
    });
  } catch (err) {
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`⚠️ Error: ${err.message}`)],
      ephemeral: true,
    });
  }
}
