/**
 * Ultra High-Fidelity UI Helpers
 */

/**
 * Formats milliseconds into clean digital mm:ss or hh:mm:ss format
 */
export function formatDuration(ms) {
  if (!ms || isNaN(ms) || ms < 0) return '00:00';
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / 60000) % 60);
  const hours = Math.floor(ms / 3600000);
  const pad = (n) => String(n).padStart(2, '0');
  return hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Ultra sleek, clean Discord progress bar with indicator
 */
export function createProgressBar(current, total, size = 18) {
  if (!total || total === 0) return '🔘' + '▬'.repeat(size);
  const progress = Math.min(Math.max(current / total, 0), 1);
  const progressIndex = Math.round(size * progress);
  const emptyProgress = Math.max(0, size - progressIndex);

  return '▬'.repeat(progressIndex) + '🔘' + '▬'.repeat(emptyProgress);
}

/**
 * Array pagination helper
 */
export function paginate(arr, page = 0, pageSize = 10) {
  const totalPages = Math.max(1, Math.ceil(arr.length / pageSize));
  const safePage = Math.min(Math.max(0, page), totalPages - 1);
  return {
    items: arr.slice(safePage * pageSize, (safePage + 1) * pageSize),
    page: safePage,
    totalPages,
    total: arr.length,
  };
}

/**
 * Safe string truncation
 */
export function truncate(str, max = 50) {
  return str && str.length > max ? str.slice(0, max - 3) + '...' : str || '';
}

/**
 * Markdown escape
 */
export function escapeMarkdown(str) {
  return str ? str.replace(/[*_`~\\|>]/g, '\\$&') : '';
}

/**
 * Parse human time string into milliseconds
 */
export function parseTime(str) {
  if (!str) return null;
  if (str.includes(':')) {
    const parts = str.split(':').map(Number);
    if (parts.some(isNaN)) return null;
    if (parts.length === 2) return (parts[0] * 60 + parts[1]) * 1000;
    if (parts.length === 3) return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
  }
  const sec = parseInt(str);
  if (!isNaN(sec)) return sec * 1000;
  return null;
}

/**
 * Shuffle array in-place
 */
export function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Format bytes
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format uptime
 */
export function formatUptime(ms) {
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const pad = (n) => String(n).padStart(2, '0');
  if (d) return `${d}d ${pad(h)}h ${pad(m)}m`;
  return `${pad(h)}h ${pad(m)}m ${pad(s)}s`;
}
