import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';
import { handleVoteSkip } from '../../systems/DJSystem.js';
import { GuildSettings } from '../../database/GuildSettings.js';

export const voiceOnly = true;
export const playerRequired = true;
export const cooldown = 2;

export const data = new SlashCommandBuilder()
  .setName('skip')
  .setDescription('Skip the currently playing track or vote to skip')
  .addIntegerOption((o) =>
    o.setName('to')
      .setDescription('Skip to position in queue (DJ only)')
      .setMinValue(1)
      .setRequired(false)
  );

export async function execute(interaction) {
  const player = interaction.client.lavalink.getPlayer(interaction.guildId);
  if (!player?.queue?.current) {
    return interaction.reply({
      embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Nothing is currently playing!')],
      ephemeral: true,
    });
  }

  if (player.voiceChannelId !== interaction.member.voice.channel?.id) {
    return interaction.reply({
      embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Join the bot\'s voice channel to skip!')],
      ephemeral: true,
    });
  }

  const settings = GuildSettings.get(interaction.guildId);
  const skipTo = interaction.options.getInteger('to');
  const title = player.queue.current.info.title;

  if (skipTo) {
    const { hasDJPermission } = await import('../../systems/DJSystem.js');
    const isDJ = await hasDJPermission(interaction, player);
    if (!isDJ) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Only DJs can skip directly to a specific position!')],
        ephemeral: true,
      });
    }

    if (skipTo > player.queue.tracks.length) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Position #${skipTo} exceeds queue size (${player.queue.tracks.length})!`)],
        ephemeral: true,
      });
    }

    await player.skip(skipTo);
    return interaction.reply({
      embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription(`⏭️ Skipped forward to position **#${skipTo}** in queue!`)]
    });
  }

  if (settings.voteSkipEnabled) {
    const result = handleVoteSkip(player, interaction.user.id, settings);
    if (!result.passed) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(COLORS.warning).setDescription(`🗳️ Vote skip: **${result.current}/${result.needed}** votes received. Vote counted!`)]
      });
    }
  }

  await player.skip();
  await interaction.reply({
    embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription(`⏭️ Skipped **${title}**`)]
  });
}
