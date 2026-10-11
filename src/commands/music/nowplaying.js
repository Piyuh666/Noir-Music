import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';
import { formatDuration, createProgressBar, truncate } from '../../utils/helpers.js';

export const playerRequired = true;
export const cooldown = 2;

export const data = new SlashCommandBuilder()
  .setName('nowplaying')
  .setDescription('Display detailed information and progress of the currently playing track');

export async function execute(interaction) {
  const player = interaction.client.lavalink.getPlayer(interaction.guildId);
  if (!player?.queue?.current) {
    return interaction.reply({ 
      embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ There is nothing currently playing!')], 
      ephemeral: true 
    });
  }

  const track = player.queue.current;
  const pos = player.position || 0;
  const dur = track.info.duration || 0;
  const bar = track.info.isStream ? '🔴 **LIVE STREAM**' : `${createProgressBar(pos, dur, 18)}\n\`${formatDuration(pos)} / ${formatDuration(dur)}\``;

  const embed = new EmbedBuilder()
    .setColor(COLORS.primary)
    .setTitle(`🎶 ${truncate(track.info.title, 80)}`)
    .setURL(track.info.uri || 'https://discord.com')
    .setDescription([
      `**Artist:** \`${track.info.author || 'Unknown'}\``,
      `**Requested By:** <@${track.requester?.id || interaction.user.id}>`,
      '',
      bar,
      ''
    ].join('\n'))
    .addFields(
      { name: '🔊 Volume', value: `\`${player.volume}%\``, inline: true },
      { name: '🔁 Loop Mode', value: `\`${(player.repeatMode || 'off').toUpperCase()}\``, inline: true },
      { name: '🌐 24/7 Mode', value: `\`${player.customData?.twentyFourSeven ? 'Active' : 'Disabled'}\``, inline: true },
      { name: '♾️ Autoplay', value: `\`${player.customData?.autoplay ? 'Active' : 'Disabled'}\``, inline: true },
      { name: '📜 Queue Length', value: `\`${player.queue.tracks.length} track(s)\``, inline: true },
      { name: '📡 Audio Source', value: `\`${track.info.sourceName || 'Lavalink'}\``, inline: true },
    )
    .setFooter({ text: `Server Audio Channel: ${interaction.guild.name}` });

  if (track.info.artworkUrl) {
    embed.setThumbnail(track.info.artworkUrl);
  }

  if (player.queue.tracks.length > 0) {
    const next = player.queue.tracks[0];
    embed.addFields({ 
      name: '⏭️ Up Next in Queue', 
      value: `[${truncate(next.info.title, 55)}](${next.info.uri}) (\`${formatDuration(next.info.duration)}\`)` 
    });
  }

  await interaction.reply({ embeds: [embed] });
}
