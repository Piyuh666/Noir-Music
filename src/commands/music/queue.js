import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { COLORS } from '../../config.js';
import { formatDuration, paginate, truncate } from '../../utils/helpers.js';

export const cooldown = 2;

export const data = new SlashCommandBuilder()
  .setName('queue')
  .setDescription('View the current music queue and upcoming tracks')
  .addIntegerOption((o) => o.setName('page').setDescription('Queue page number').setMinValue(1).setRequired(false));

export async function execute(interaction) {
  const player = interaction.client.lavalink.getPlayer(interaction.guildId);
  if (!player || (!player.queue.current && player.queue.tracks.length === 0)) {
    return interaction.reply({ 
      embeds: [new EmbedBuilder().setColor(COLORS.warning).setDescription('📜 **The music queue is currently empty!** Add songs with `/play`.')], 
      ephemeral: true 
    });
  }

  const reqPage = (interaction.options.getInteger('page') || 1) - 1;
  const { items, page, totalPages, total } = paginate(player.queue.tracks, reqPage, 10);
  const totalMs = player.queue.tracks.reduce((a, t) => a + (t.info.duration || 0), 0);

  let desc = '';
  if (player.queue.current) {
    const c = player.queue.current;
    desc += `**▶ Now Playing:**\n[${truncate(c.info.title, 55)}](${c.info.uri}) — \`${formatDuration(c.info.duration)}\` (<@${c.requester?.id || interaction.user.id}>)\n\n`;
  }

  if (items.length > 0) {
    desc += `**📜 Upcoming Tracks (Page ${page + 1}/${totalPages}):**\n`;
    items.forEach((t, i) => {
      const idx = page * 10 + i + 1;
      desc += `\`${idx}.\` [${truncate(t.info.title, 48)}](${t.info.uri}) — \`${formatDuration(t.info.duration)}\`\n`;
    });
  } else {
    desc += '*No more songs queued.*';
  }

  const embed = new EmbedBuilder()
    .setColor(COLORS.primary)
    .setTitle(`📜 Music Queue — ${interaction.guild.name}`)
    .setDescription(desc)
    .setFooter({ 
      text: `Total Songs: ${total} | Total Runtime: ${formatDuration(totalMs)} | Repeat: ${(player.repeatMode || 'off').toUpperCase()}` 
    });

  const makeRow = (p) => new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`queue_prev_${p}`).setLabel('Previous').setEmoji('◀️').setStyle(ButtonStyle.Secondary).setDisabled(p === 0),
    new ButtonBuilder().setCustomId(`queue_next_${p}`).setLabel('Next').setEmoji('▶️').setStyle(ButtonStyle.Secondary).setDisabled(p >= totalPages - 1),
  );

  const msg = await interaction.reply({ 
    embeds: [embed], 
    components: totalPages > 1 ? [makeRow(page)] : [], 
    fetchReply: true 
  });

  if (totalPages <= 1) return;

  const collector = msg.createMessageComponentCollector({ 
    filter: (i) => i.user.id === interaction.user.id, 
    time: 60000 
  });

  let currentPage = page;
  collector.on('collect', async (i) => {
    if (i.customId.startsWith('queue_prev_')) currentPage = Math.max(0, currentPage - 1);
    else if (i.customId.startsWith('queue_next_')) currentPage = Math.min(totalPages - 1, currentPage + 1);

    const p2 = interaction.client.lavalink.getPlayer(interaction.guildId);
    if (!p2) return i.update({ components: [] });

    const { items: it2, totalPages: tp2 } = paginate(p2.queue.tracks, currentPage, 10);
    let d2 = '';
    if (p2.queue.current) {
      const c = p2.queue.current;
      d2 += `**▶ Now Playing:**\n[${truncate(c.info.title, 55)}](${c.info.uri}) — \`${formatDuration(c.info.duration)}\`\n\n`;
    }
    if (it2.length > 0) {
      d2 += `**📜 Upcoming Tracks (Page ${currentPage + 1}/${tp2}):**\n`;
      it2.forEach((t, i2) => {
        const idx = currentPage * 10 + i2 + 1;
        d2 += `\`${idx}.\` [${truncate(t.info.title, 48)}](${t.info.uri}) — \`${formatDuration(t.info.duration)}\`\n`;
      });
    }

    const emb2 = new EmbedBuilder()
      .setColor(COLORS.primary)
      .setTitle(`📜 Music Queue — ${interaction.guild.name}`)
      .setDescription(d2)
      .setFooter({ text: `Total Songs: ${p2.queue.tracks.length} | Repeat: ${(p2.repeatMode || 'off').toUpperCase()}` });

    await i.update({ embeds: [emb2], components: tp2 > 1 ? [makeRow(currentPage)] : [] });
  });

  collector.on('end', () => msg.edit({ components: [] }).catch(() => {}));
}
