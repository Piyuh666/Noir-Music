import { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } from 'discord.js';
import { COLORS } from '../../config.js';
import { GuildSettings } from '../../database/GuildSettings.js';

export const cooldown = 5;

export const data = new SlashCommandBuilder()
  .setName('voteskip')
  .setDescription('Configure vote-skip settings')
  .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
  .addSubcommand((s) => s.setName('toggle').setDescription('Enable or disable vote-skip'))
  .addSubcommand((s) => s.setName('percentage').setDescription('Set the percentage of votes needed').addIntegerOption((o) => o.setName('value').setDescription('Percentage (10-100)').setMinValue(10).setMaxValue(100).setRequired(true)));

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  const settings = GuildSettings.get(interaction.guildId);
  if (sub === 'toggle') {
    const newVal = !settings.voteSkipEnabled;
    GuildSettings.setField(interaction.guildId, 'voteSkipEnabled', newVal);
    return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.primary).setDescription(`🗳️ Vote skip is now **${newVal ? 'ENABLED 🟢' : 'DISABLED 🔴'}**`)] });
  }
  if (sub === 'percentage') {
    const pct = interaction.options.getInteger('value');
    GuildSettings.setField(interaction.guildId, 'voteSkipPercentage', pct);
    return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription(`🗳️ Vote skip percentage set to **${pct}%**`)] });
  }
}
