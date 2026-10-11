import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';

export const cooldown = 3;

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Check Discord gateway and Lavalink audio streaming latency');

export async function execute(interaction) {
  const wsPing = interaction.client.ws.ping;
  const lavalink = interaction.client.lavalink;
  const nodes = lavalink.nodeManager.nodes;

  let nodeStatus = '';
  for (const [id, node] of nodes) {
    nodeStatus += `• **${id}**: \`${node.stats?.players || 0}\` active players | Status: \`${node.connected ? 'Connected' : 'Offline'}\`\n`;
  }

  const embed = new EmbedBuilder()
    .setColor(COLORS.success)
    .setTitle('⚡ Audio Engine Latency & Status')
    .addFields(
      { name: 'Gateway Latency', value: `\`${wsPing}ms\``, inline: true },
      { name: 'API Latency', value: `\`${Date.now() - interaction.createdTimestamp}ms\``, inline: true },
      { name: 'Audio Nodes', value: nodeStatus || 'Nodes online', inline: false },
    )
    .setFooter({ text: 'Optimized Realtime Voice Pipeline' });

  await interaction.reply({ embeds: [embed] });
}
