import 'dotenv/config';

// Ultra Clean Luxury Audiophile Palette - Pure & Unbranded
export const COLORS = {
  primary: 0x5865F2,    // Deep Discord Blurple / Royal Indigo
  accent: 0x9B59B6,     // Neon Amethyst Accent
  surface: 0x2B2D31,    // Rich Graphite Dark
  dark: 0x1E1F22,       // Deep Midnight
  success: 0x57F287,    // Mint Neon Green
  error: 0xED4245,      // Vibrant Ruby Red
  warning: 0xFEE75C,    // Bright Amber Gold
  info: 0x5865F2,       // Azure Blue
};

export const DEFAULT_VOLUME = 80;
export const MAX_QUEUE_SIZE = 1000;
export const IDLE_TIMEOUT = 180000; // 3 minutes
export const ALONE_TIMEOUT = 45000;  // 45 seconds

export const FILTERS = {
  bassboost: { equalizer: [{band:0,gain:0.65},{band:1,gain:0.7},{band:2,gain:0.5},{band:3,gain:0.3}] },
  nightcore: { timescale: { speed: 1.28, pitch: 1.28, rate: 1.0 } },
  vaporwave: { timescale: { speed: 0.82, pitch: 0.82, rate: 1.0 }, equalizer: [{band:1,gain:0.3},{band:0,gain:0.3}] },
  '8d': { rotation: { rotationHz: 0.22 } },
  karaoke: { karaoke: { level: 1.0, monoLevel: 1.0, filterBand: 220.0, filterWidth: 100.0 } },
  tremolo: { tremolo: { frequency: 2.0, depth: 0.55 } },
  vibrato: { vibrato: { frequency: 2.0, depth: 0.55 } },
  daycore: { timescale: { speed: 0.85, pitch: 0.85 }, equalizer: [{band:0,gain:0.4},{band:1,gain:0.3}] },
  soft: { equalizer: [{band:0,gain:0},{band:1,gain:0},{band:2,gain:0},{band:3,gain:0},{band:4,gain:0},{band:5,gain:0},{band:6,gain:0},{band:7,gain:0},{band:8,gain:-0.2},{band:9,gain:-0.2},{band:10,gain:-0.25},{band:11,gain:-0.25},{band:12,gain:-0.3},{band:13,gain:-0.5},{band:14,gain:-0.75}] },
  pop: { equalizer: [{band:0,gain:0.65},{band:1,gain:0.45},{band:2,gain:-0.25},{band:3,gain:-0.45},{band:4,gain:-0.25},{band:5,gain:0.75},{band:6,gain:0.9},{band:7,gain:1.0},{band:8,gain:1.1},{band:9,gain:0.6},{band:10,gain:0},{band:11,gain:0},{band:12,gain:0},{band:13,gain:0},{band:14,gain:0}] },
  earrape: { distortion: { sinOffset: 0, sinScale: 1.0, cosOffset: 0, cosScale: 1.0, tanOffset: 0, tanScale: 0, offset: 0, scale: 1.25 }, volume: 3.5 },
  lofi: { equalizer: [{band:0,gain:0.36},{band:1,gain:0.34},{band:2,gain:0.1},{band:3,gain:0.0},{band:4,gain:0.0},{band:5,gain:-0.05}], lowPass: { smoothing: 5 } },
  metal: { equalizer: [{band:0,gain:0.0},{band:1,gain:0.1},{band:2,gain:0.1},{band:3,gain:0.15},{band:4,gain:0.13},{band:5,gain:0.1},{band:6,gain:0.0},{band:7,gain:0.125},{band:8,gain:0.175},{band:9,gain:0.175},{band:10,gain:0.125},{band:11,gain:0.125},{band:12,gain:0.1},{band:13,gain:0.075},{band:14,gain:0.0}] },
  piano: { equalizer: [{band:0,gain:-0.25},{band:1,gain:-0.25},{band:2,gain:-0.125},{band:3,gain:0.0},{band:4,gain:0.25},{band:5,gain:0.25},{band:6,gain:0.0},{band:7,gain:-0.25},{band:8,gain:-0.25},{band:9,gain:0.0},{band:10,gain:0.0},{band:11,gain:0.5},{band:12,gain:0.25},{band:13,gain:-0.025}] },
  electronic: { equalizer: [{band:0,gain:0.375},{band:1,gain:0.35},{band:2,gain:0.125},{band:3,gain:0.0},{band:4,gain:0.0},{band:5,gain:-0.125},{band:6,gain:-0.125},{band:7,gain:0.0},{band:8,gain:0.25},{band:9,gain:0.125},{band:10,gain:0.15},{band:11,gain:0.2},{band:12,gain:0.25},{band:13,gain:0.35},{band:14,gain:0.4}] },
};

export const LAVALINK_NODES = [
  {
    id: 'node-nazha-fast',
    host: 'lavalink.nazha.online',
    port: 443,
    authorization: 'nazhafreelava',
    secure: true,
    retryAmount: 5,
    retryDelay: 3000
  },
  {
    id: 'node-millohost-fast',
    host: 'lava-v4.millohost.my.id',
    port: 443,
    authorization: 'https://discord.gg/mjS5J2K3ep',
    secure: true,
    retryAmount: 5,
    retryDelay: 3000
  }
];

export const BOT_ACTIVITY = [
  { type: 2, name: 'High-Fidelity Audio' },
  { type: 0, name: '/play <song>' },
  { type: 3, name: 'Crystal Clear Streams' },
];
