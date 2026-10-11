import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';
import { truncate } from '../../utils/helpers.js';

export const cooldown = 5;

export const data = new SlashCommandBuilder()
  .setName('lyrics')
  .setDescription('Fetch synced lyrics for the current or specified song')
  .addStringOption((o) => o.setName('song').setDescription('Song name or title (defaults to currently playing)').setRequired(false));

export async function execute(interaction) {
  await interaction.deferReply();
  let query = interaction.options.getString('song');
  if (!query) {
    const player = interaction.client.lavalink.getPlayer(interaction.guildId);
    if (player?.queue?.current) {
      query = `${player.queue.current.info.title} ${player.queue.current.info.author || ''}`;
    }
  }

  if (!query) {
    return interaction.editReply({ 
      embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ No song is currently playing, and no title was provided!')] 
    });
  }

  try {
    const cleanQuery = query.replace(/\(.*?\)|\[.*?\]/g, '').trim();
    const res = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(cleanQuery.split(' ')[0] || cleanQuery)}/${encodeURIComponent(cleanQuery)}`);
    let lyricsText = null;
    if (res.ok) {
      const data = await res.json();
      lyricsText = data.lyrics;
    }

    if (!lyricsText) {
      return interaction.editReply({ 
        embeds: [new EmbedBuilder().setColor(COLORS.warning).setDescription(`⚠️ No lyrics found for **${truncate(query, 60)}**.\nTry searching with explicit artist and title.`)] 
      });
    }

    const trimmed = lyricsText.length > 3900 ? lyricsText.substring(0, 3900) + '...' : lyricsText;
    const embed = new EmbedBuilder()
      .setColor(COLORS.primary)
      .setTitle(`📝 Lyrics: ${truncate(query, 60)}`)
      .setDescription(trimmed)
      .setFooter({ text: 'Synced Lyrics Provider' });

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    await interaction.editReply({ 
      embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`⚠️ Failed to load lyrics: ${err.message}`)] 
    });
  }
}
