import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';

export const voiceOnly = true;
export const playerRequired = true;
export const djOnly = true;
export const cooldown = 3;

export const data = new SlashCommandBuilder()
  .setName('grab')
  .setDescription('Send the currently playing track details directly to your Direct Messages');

export async function execute(interaction) {
  const player = interaction.client.lavalink.getPlayer(interaction.guildId);
  const track = player.queue.current;

  const embed = new EmbedBuilder()
    .setColor(COLORS.primary)
    .setTitle(`🎵 ${track.info.title}`)
    .setURL(track.info.uri || 'https://discord.com')
    .addFields(
      { name: 'Artist', value: `\`${track.info.author || 'Unknown'}\``, inline: true },
      { name: 'Server', value: `\`${interaction.guild.name}\``, inline: true },
    )
    .setFooter({ text: 'Saved from music stream' });

  if (track.info.artworkUrl) {
    embed.setThumbnail(track.info.artworkUrl);
  }

  try {
    await interaction.user.send({ embeds: [embed] });
    await interaction.reply({ 
      embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription('📬 Song details sent directly to your DMs!')], 
      ephemeral: true 
    });
  } catch {
    await interaction.reply({ 
      embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Unable to send DM! Please check your privacy settings.')], 
      ephemeral: true 
    });
  }
}
