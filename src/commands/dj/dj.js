import { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } from 'discord.js';
import { COLORS } from '../../config.js';
import { GuildSettings } from '../../database/GuildSettings.js';

export const cooldown = 5;

export const data = new SlashCommandBuilder()
  .setName('dj')
  .setDescription('Configure the DJ role and DJ-only mode')
  .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
  .addSubcommand((s) => s.setName('setrole').setDescription('Set the DJ role').addRoleOption((o) => o.setName('role').setDescription('DJ role to set').setRequired(true)))
  .addSubcommand((s) => s.setName('removerole').setDescription('Remove the current DJ role'))
  .addSubcommand((s) => s.setName('toggle').setDescription('Toggle DJ-only mode (only DJs can control music)'))
  .addSubcommand((s) => s.setName('info').setDescription('View current DJ settings'));

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  const settings = GuildSettings.get(interaction.guildId);
  if (sub === 'setrole') {
    const role = interaction.options.getRole('role');
    GuildSettings.setField(interaction.guildId, 'djRole', role.id);
    return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription(`🎧 DJ role set to ${role}!`)] });
  }
  if (sub === 'removerole') {
    GuildSettings.setField(interaction.guildId, 'djRole', null);
    return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription('🎧 DJ role removed.')] });
  }
  if (sub === 'toggle') {
    const newVal = !settings.djOnly;
    GuildSettings.setField(interaction.guildId, 'djOnly', newVal);
    return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.primary).setDescription(`🎧 DJ-only mode is now **${newVal ? 'ENABLED 🟢' : 'DISABLED 🔴'}**\n${newVal ? 'Only members with the DJ role can control music.' : 'Everyone can control music.'}`)] });
  }
  if (sub === 'info') {
    const role = settings.djRole ? `<@&${settings.djRole}>` : 'Not set';
    const embed = new EmbedBuilder().setColor(COLORS.primary).setTitle('🎧 DJ Settings')
      .addFields(
        { name: 'DJ Role', value: role, inline: true },
        { name: 'DJ-Only Mode', value: settings.djOnly ? '🟢 Enabled' : '🔴 Disabled', inline: true },
      );
    return interaction.reply({ embeds: [embed] });
  }
}
