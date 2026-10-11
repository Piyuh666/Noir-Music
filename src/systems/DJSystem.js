import { GuildSettings } from '../database/GuildSettings.js';

/**
 * Determines whether a member has DJ permissions.
 * DJ permission = server admin OR has DJ role OR is alone with bot.
 */
export async function hasDJPermission(interaction, player) {
  const member = interaction.member;

  // Server admin always passes
  if (member.permissions.has('Administrator')) return true;
  if (member.permissions.has('ManageGuild')) return true;

  const settings = GuildSettings.get(interaction.guildId);

  // If DJ-only mode is off, everyone in the vc can use commands
  if (!settings.djOnly) return true;

  // Has DJ role
  if (settings.djRole && member.roles.cache.has(settings.djRole)) return true;

  // If alone in VC with bot, allow
  if (player && player.voiceChannelId) {
    const voiceChannel = interaction.guild.channels.cache.get(player.voiceChannelId);
    if (voiceChannel) {
      const humanMembers = voiceChannel.members.filter((m) => !m.user.bot);
      if (humanMembers.size === 1 && humanMembers.has(member.id)) return true;
    }
  }

  return false;
}

/**
 * Vote skip logic
 */
export function handleVoteSkip(player, userId, settings) {
  const votes = player.customData?.voteSkipUsers || new Set();
  votes.add(userId);
  if (player.customData) player.customData.voteSkipUsers = votes;

  const voiceChannel = player._client?.channels?.cache?.get(player.voiceChannelId);
  const humanCount = voiceChannel ? voiceChannel.members.filter((m) => !m.user.bot).size : 1;
  const needed = Math.ceil(humanCount * (settings.voteSkipPercentage / 100));
  const current = votes.size;

  return { current, needed, passed: current >= needed };
}
