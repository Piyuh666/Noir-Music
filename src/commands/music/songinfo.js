import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';

export const voiceOnly = true;
export const playerRequired = true;
export const cooldown = 2;

export const data = new SlashCommandBuilder()
  .setName('songinfo')
  .setDescription('View technical audio details, bitrate, and source metadata of current track');

export async function execute(interaction) {
  const player = interaction.client.lavalink.getPlayer(interaction.guildId);
  const track = player.queue.current;

  const embed = new EmbedBuilder()
    .setColor(COLORS.primary)
    .setTitle(`🎧 ${track.info.title}`)
    .setURL(track.info.uri || 'https://discord.com')
    .addFields(
      { name: 'Author / Channel', value: `\`${track.info.author || 'Unknown'}\``, inline: true },
      { name: 'Audio Source', value: `\`${track.info.sourceName || 'Lavalink'}\``, inline: true },
      { name: 'Identifier', value: `\`${track.info.identifier}\``, inline: true },
      { name: 'Stream Type', value: track.info.isStream ? '`🔴 Live Audio`' : '`Standard Track`', inline: true },
      { name: 'Seekable', value: track.info.isSeekable ? '`Yes`' : '`No`', inline: true },
      { name: 'Requester', value: `<@${track.requester?.id || interaction.user.id}>`, inline: true },
    )
    .setFooter({ text: 'High-Fidelity Audio Stream Engine' });

  if (track.info.artworkUrl) embed.setThumbnail(track.info.artworkUrl);

  await interaction.reply({ embeds: [embed] });
}
