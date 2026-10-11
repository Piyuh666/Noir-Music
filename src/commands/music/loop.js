import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';

export const voiceOnly = true;
export const playerRequired = true;
export const djOnly = true;
export const cooldown = 2;

export const data = new SlashCommandBuilder().setName('loop').setDescription('Set playback repeat mode (DJ only)')
  .addStringOption((o) => o.setName('mode').setDescription('Repeat mode').setRequired(true)
    .addChoices({ name: '❌ Off', value: 'off' }, { name: '🔂 Current Track', value: 'track' }, { name: '🔁 Entire Queue', value: 'queue' }));

export async function execute(interaction) {
  const player = interaction.client.lavalink.getPlayer(interaction.guildId);
  const mode = interaction.options.getString('mode');
  await player.setRepeatMode(mode);
  const icons = { off: '❌', track: '🔂', queue: '🔁' };
  await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription(`${icons[mode]} Loop mode set to **${mode.toUpperCase()}**`)] });
}
