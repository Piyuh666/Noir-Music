import chalk from 'chalk';

const timestamp = () => new Date().toLocaleTimeString('en-US', { hour12: false });

export const logger = {
  info: (msg) => console.log(`${chalk.gray(`[${timestamp()}]`)} ${chalk.cyan('[INFO]')} ${msg}`),
  success: (msg) => console.log(`${chalk.gray(`[${timestamp()}]`)} ${chalk.green('[OK]')} ${msg}`),
  warn: (msg) => console.log(`${chalk.gray(`[${timestamp()}]`)} ${chalk.yellow('[WARN]')} ${msg}`),
  error: (msg) => console.log(`${chalk.gray(`[${timestamp()}]`)} ${chalk.red('[ERROR]')} ${msg}`),
  debug: (msg) => { if (process.env.DEBUG === 'true') console.log(`${chalk.gray(`[${timestamp()}]`)} ${chalk.magenta('[DEBUG]')} ${msg}`); },
  lavalink: (msg) => console.log(`${chalk.gray(`[${timestamp()}]`)} ${chalk.blue('[LAVALINK]')} ${msg}`),
  music: (msg) => console.log(`${chalk.gray(`[${timestamp()}]`)} ${chalk.magenta('[MUSIC]')} ${msg}`),
  dj: (msg) => console.log(`${chalk.gray(`[${timestamp()}]`)} ${chalk.yellow('[DJ]')} ${msg}`),
};
