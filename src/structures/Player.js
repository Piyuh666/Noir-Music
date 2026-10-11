/**
 * Extended player state manager (stored on player.customData)
 */
export class PlayerData {
  constructor() {
    this.twentyFourSeven = false; // 24/7 mode
    this.autoplay = false;        // autoplay related tracks
    this.voteSkipUsers = new Set();
    this.djRole = null;
    this.nowPlayingMessage = null;
    this.lastActivityAt = Date.now();
    this.startedAt = Date.now();
  }

  touch() { this.lastActivityAt = Date.now(); }
}
