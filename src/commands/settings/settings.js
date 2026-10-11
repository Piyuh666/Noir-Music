import { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } from 'discord.js';
import { COLORS } from '../../config.js';
import { GuildSettings } from '../../database/GuildSettings.js';

export const cooldown = 5;

export const data = new SlashCommandBuilder()
  .setName('settings')
  .setDescription('Configure bot settings for this server')
  .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
  .addSubcommand((s) => s.setName('view').setDescription('View all current settings'))
  .addSubcommand((s) => s.setName('reset').setDescription('Reset all settings to defaults'))
  .addSubcommand((s) => s.setName('announcetracks').setDescription('Toggle track announcement on song change'))
  .addSubcommand((s) => s.setName('defaultvolume').setDescription('Set the default player volume').addIntegerOption((o) => o.setName('level').setDescription('Volume 1-150').setMinValue(1).setMaxValue(150).setRequired(true)))
  .addSubcommand((s) => s.setName('platform').setDescription('Set default search platform').addStringOption((o) => o.setName('name').setDescription('Platform').setRequired(true).addChoices({ name: 'YouTube', value: 'ytsearch' }, { name: 'YouTube Music', value: 'ytmsearch' }, { name: 'SoundCloud', value: 'scsearch' })))
  .addSubcommand((s) => s.setName('channel').setDescription('Restrict music commands to a specific channel').addChannelOption((o) => o.setName('channel').setDescription('Channel to restrict to (leave empty to remove restriction)').setRequired(false)));

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  if (sub === 'view') {
    const s = GuildSettings.get(interaction.guildId);
    const embed = new EmbedBuilder().setColor(COLORS.primary).setTitle(`⚙️ Settings — ${interaction.guild.name}`)
      .addFields(
        { name: '🎧 DJ Role', value: s.djRole ? `<@&${s.djRole}>` : 'Not set', inline: true },
        { name: '🔒 DJ-Only Mode', value: s.djOnly ? '🟢 ON' : '🔴 OFF', inline: true },
        { name: '🔊 Default Volume', value: `${s.volume}%`, inline: true },
        { name: '📢 Announce Tracks', value: s.announceTrack ? '🟢 ON' : '🔴 OFF', inline: true },
        { name: '🔍 Search Platform', value: s.defaultSearchPlatform, inline: true },
        { name: '🗳️ Vote Skip', value: s.voteSkipEnabled ? `🟢 ON (${s.voteSkipPercentage}%)` : '🔴 OFF', inline: true },
        { name: '🌐 24/7 Mode', value: s.twentyFourSeven ? '🟢 ON' : '🔴 OFF', inline: true },
        { name: '♾️ Autoplay', value: s.autoplay ? '🟢 ON' : '🔴 OFF', inline: true },
        { name: '📌 Restricted Channel', value: s.restrictedChannelId ? `<#${s.restrictedChannelId}>` : 'None', inline: true },
      );
    return interaction.reply({ embeds: [embed] });
  }
  if (sub === 'reset') {
    GuildSettings.reset(interaction.guildId);
    return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription('⚙️ All settings reset to defaults!')] });
  }
  if (sub === 'announcetracks') {
    const s = GuildSettings.get(interaction.guildId);
    GuildSettings.setField(interaction.guildId, 'announceTrack', !s.announceTrack);
    return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription(`📢 Track announcements: **${!s.announceTrack ? 'ENABLED 🟢' : 'DISABLED 🔴'}**`)] });
  }
  if (sub === 'defaultvolume') {
    const level = interaction.options.getInteger('level');
    GuildSettings.setField(interaction.guildId, 'volume', level);
    return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription(`🔊 Default volume set to **${level}%**`)] });
  }
  if (sub === 'platform') {
    const name = interaction.options.getString('name');
    GuildSettings.setField(interaction.guildId, 'defaultSearchPlatform', name);
    return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription(`🔍 Default search platform set to **${name}**`)] });
  }
  if (sub === 'channel') {
    const ch = interaction.options.getChannel('channel');
    GuildSettings.setField(interaction.guildId, 'restrictedChannelId', ch?.id || null);
    return interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription(ch ? `📌 Music commands restricted to <#${ch.id}>` : '📌 Channel restriction removed.')] });
  }
}
