import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../config.js';

/**
 * Clean, modern unbranded embed factory
 */
export const Embed = {
  success: (desc, title) => {
    const e = new EmbedBuilder()
      .setColor(COLORS.success)
      .setDescription(`✅ ${desc}`);
    if (title) e.setTitle(title);
    return e;
  },

  error: (desc, title) => {
    const e = new EmbedBuilder()
      .setColor(COLORS.error)
      .setDescription(`❌ ${desc}`);
    if (title) e.setTitle(title);
    return e;
  },

  warn: (desc, title) => {
    const e = new EmbedBuilder()
      .setColor(COLORS.warning)
      .setDescription(`⚠️ ${desc}`);
    if (title) e.setTitle(title);
    return e;
  },

  info: (desc, title) => {
    const e = new EmbedBuilder()
      .setColor(COLORS.primary)
      .setDescription(desc);
    if (title) e.setTitle(title);
    return e;
  },

  music: (desc, title) => {
    const e = new EmbedBuilder()
      .setColor(COLORS.primary)
      .setDescription(desc);
    if (title) e.setTitle(title);
    return e;
  },
};
