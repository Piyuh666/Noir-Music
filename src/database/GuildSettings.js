import { db } from './db.js';

const DEFAULTS = {
  prefix: '!',
  djRole: null,
  djOnly: false,
  volume: 80,
  twentyFourSeven: false,
  autoplay: false,
  announceTrack: true,
  defaultSearchPlatform: 'ytsearch',
  voteSkipEnabled: true,
  voteSkipPercentage: 50,
  restrictedChannelId: null, // music commands only in this channel
  logChannelId: null,
};

export class GuildSettings {
  static key(guildId) { return `guild:${guildId}`; }

  static get(guildId) {
    return { ...DEFAULTS, ...(db.get(GuildSettings.key(guildId)) || {}) };
  }

  static set(guildId, updates) {
    const current = GuildSettings.get(guildId);
    const updated = { ...current, ...updates };
    db.set(GuildSettings.key(guildId), updated);
    return updated;
  }

  static reset(guildId) {
    db.delete(GuildSettings.key(guildId));
    return { ...DEFAULTS };
  }

  static setField(guildId, field, value) {
    return GuildSettings.set(guildId, { [field]: value });
  }
}
