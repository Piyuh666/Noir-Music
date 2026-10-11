import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config.js';

export const cooldown = 3;

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('View the entire list of high-performance music commands')
  .addStringOption((o) => 
    o.setName('category')
      .setDescription('Filter commands by module')
      .addChoices(
        { name: 'Playback Controls', value: 'playback' },
        { name: 'Queue & Playlist', value: 'queue' },
        { name: 'Audio DSP Filters', value: 'filters' },
        { name: 'DJ & Server Management', value: 'management' }
      )
      .setRequired(false)
  );

export async function execute(interaction) {
  const cat = interaction.options.getString('category');

  const embed = new EmbedBuilder()
    .setColor(COLORS.primary)
    .setTitle('🎵 Music Bot Command Directory')
    .setFooter({ text: 'Use /[command] to execute any action' });

  if (!cat || cat === 'playback') {
    embed.addFields({
      name: '▶️ Playback Commands',
      value: [
        '`/play <query>` — Play audio from YouTube, Spotify, SoundCloud, or URL',
        '`/playnext <query>` — Force a song to play next in the queue',
        '`/pause` & `/resume` — Toggle audio playback',
        '`/skip [to]` — Skip the current track or jump to a number',
        '`/skipto <position>` — Jump to a specific track',
        '`/stop` — Stop audio, clear the queue, and leave voice channel',
        '`/previous` — Replay the previous song',
        '`/restart` & `/replay` — Restart current song from 00:00',
        '`/seek <time>` — Jump to a timestamp (e.g. `1:30`)',
        '`/forward <seconds>` & `/rewind <seconds>` — Fast-forward or step back',
        '`/volume <level>` — Set volume (1-150%)',
        '`/volup` & `/voldown` — Step volume up or down by 10%',
        '`/mute` & `/unmute` — Mute or unmute playback',
      ].join('\n')
    });
  }

  if (!cat || cat === 'queue') {
    embed.addFields({
      name: '📜 Queue & Track Inspection',
      value: [
        '`/nowplaying` — View detailed track progress and telemetry',
        '`/queue [page]` — Paginated queue list',
        '`/songinfo` — View technical audio bitrate and track metadata',
        '`/lyrics [song]` — Display synced track lyrics',
        '`/grab` — Send the currently playing track to your DMs',
        '`/shuffle` — Randomize queue order',
        '`/reverse` — Invert the queue order',
        '`/clear` — Clear all songs from queue',
        '`/remove <position>` — Remove a specific track',
        '`/removedupes` — Remove duplicate songs from queue',
        '`/move <from> <to>` — Move a track to a new slot',
        '`/swap <track1> <track2>` — Swap positions of two tracks',
        '`/loop <off|track|queue>` — Set track or queue looping',
        '`/jump <position>` — Jump forward to a track',
        '`/search <query>` — Interactive song search picker',
      ].join('\n')
    });
  }

  if (!cat || cat === 'filters') {
    embed.addFields({
      name: '🎛️ Audio DSP Filters',
      value: [
        '`/filter <name>` — Apply filters (Bass Boost, Nightcore, 8D, Lo-Fi, Vaporwave, etc.)',
        '`/filters` — View currently active audio filters',
        '`/bassboost [level]` — Low/Medium/High/Extreme bass boost',
        '`/nightcore` — Higher pitch & accelerated tempo',
        '`/vaporwave` — Slower tempo, dreamy reverb',
        '`/8d` — Rotating 360° spatial audio',
        '`/lofi` — Warm low-pass chilled audio profile',
        '`/karaoke` — Vocal frequency suppressor',
        '`/tremolo` — Volume oscillation effect',
        '`/vibrate` — Pitch oscillation effect',
        '`/speed <rate>` — Set playback speed (0.5x - 2.0x)',
        '`/pitch <value>` — Set audio pitch (0.5x - 2.0x)',
      ].join('\n')
    });
  }

  if (!cat || cat === 'management') {
    embed.addFields({
      name: '🎧 DJ & Server Settings',
      value: [
        '`/247` — Toggle 24/7 channel persistence',
        '`/autoplay` — Toggle smart auto-queueing',
        '`/dj setrole <role>` — Assign dedicated DJ role',
        '`/dj toggle` — Lock music commands to DJs only',
        '`/voteskip toggle` — Enable/disable voting to skip',
        '`/settings view` — View server audio settings',
        '`/settings channel` — Restrict bot to a specific text channel',
        '`/playlist <create|add|play|list|view|delete>` — Manage personal cloud playlists',
        '`/join` & `/leave` — Connect or disconnect bot',
        '`/ping` — Check gateway and audio streaming latency',
      ].join('\n')
    });
  }

  await interaction.reply({ embeds: [embed] });
}
