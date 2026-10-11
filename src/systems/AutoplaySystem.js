/**
 * Autoplay: fetch related YouTube video for next track
 */
export async function getAutoplayTrack(player, lastTrack) {
  try {
    if (!lastTrack || !lastTrack.info?.identifier) return null;
    const ytId = lastTrack.info.identifier;
    // Use YouTube mix/related via lavalink search
    const query = `https://www.youtube.com/watch?v=${ytId}&list=RD${ytId}`;
    const res = await player.search({ query, source: 'youtube' }, { id: 'autoplay', username: 'Autoplay' });
    if (res && res.tracks && res.tracks.length > 0) {
      // Pick a random track from first 5 results
      const pick = res.tracks[Math.floor(Math.random() * Math.min(5, res.tracks.length))];
      return pick;
    }
  } catch {}
  return null;
}
