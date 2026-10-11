import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';

export const voiceOnly = true;
export const playerRequired = true;
export const djOnly = true;
export const cooldown = 3;

export const data = new SlashCommandBuilder()
  .setName('playnext')
  .setDescription('Add a song or URL directly to the top of the queue to play next')
  .addStringOption((o) => o.setName('query').setDescription('Song name or URL').setRequired(true));

export async function execute(interaction) {
  const query = interaction.options.getString('query');
  await interaction.deferReply();

  const lavalink = interaction.client.lavalink;
  const player = lavalink.getPlayer(interaction.guildId);

  try {
    const res = await player.search({ query, source: 'ytsearch' }, interaction.user);
    if (!res || !res.tracks?.length) {
      return interaction.editReply({ 
        embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ No tracks found for: **${query}**`)] 
      });
    }

    const track = res.tracks[0];
    player.queue.tracks.unshift(track);

    const embed = new EmbedBuilder()
      .setColor(COLORS.success)
      .setTitle('⏭️ Prioritized Track')
      .setDescription(`[${track.info.title}](${track.info.uri}) will play **next** in queue!`)
      .setFooter({ text: `Requested by ${interaction.user.tag}` });

    if (track.info.artworkUrl) embed.setThumbnail(track.info.artworkUrl);

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    await interaction.editReply({ 
      embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`⚠️ Failed to load track: ${err.message}`)] 
    });
  }
}
