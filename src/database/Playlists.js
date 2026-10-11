import { db } from './db.js';

export class UserPlaylists {
  static key(userId) { return `playlists:${userId}`; }

  static getAll(userId) {
    return db.get(UserPlaylists.key(userId)) || {};
  }

  static get(userId, name) {
    return UserPlaylists.getAll(userId)[name] || null;
  }

  static create(userId, name) {
    const playlists = UserPlaylists.getAll(userId);
    if (playlists[name]) return null; // already exists
    playlists[name] = { name, tracks: [], createdAt: Date.now() };
    db.set(UserPlaylists.key(userId), playlists);
    return playlists[name];
  }

  static delete(userId, name) {
    const playlists = UserPlaylists.getAll(userId);
    if (!playlists[name]) return false;
    delete playlists[name];
    db.set(UserPlaylists.key(userId), playlists);
    return true;
  }

  static addTrack(userId, playlistName, track) {
    const playlists = UserPlaylists.getAll(userId);
    if (!playlists[playlistName]) return false;
    playlists[playlistName].tracks.push({
      title: track.info.title,
      author: track.info.author,
      uri: track.info.uri,
      duration: track.info.duration,
      artworkUrl: track.info.artworkUrl,
    });
    db.set(UserPlaylists.key(userId), playlists);
    return true;
  }

  static removeTrack(userId, playlistName, index) {
    const playlists = UserPlaylists.getAll(userId);
    if (!playlists[playlistName]) return false;
    if (index < 0 || index >= playlists[playlistName].tracks.length) return false;
    playlists[playlistName].tracks.splice(index, 1);
    db.set(UserPlaylists.key(userId), playlists);
    return true;
  }
}
