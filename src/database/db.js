// Simple JSON-based persistent storage using quick.db style with a Map + JSON file
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../../data');
const DB_FILE = join(DATA_DIR, 'bot_data.json');

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

let store = {};
try {
  store = JSON.parse(readFileSync(DB_FILE, 'utf8'));
} catch {
  store = {};
}

function save() {
  try { writeFileSync(DB_FILE, JSON.stringify(store, null, 2)); } catch {}
}

export const db = {
  get: (key) => store[key],
  set: (key, value) => { store[key] = value; save(); return value; },
  delete: (key) => { delete store[key]; save(); },
  has: (key) => key in store,
  all: () => ({ ...store }),
  keys: () => Object.keys(store),
};
