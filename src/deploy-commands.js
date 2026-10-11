import { REST, Routes } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;

if (!token || !clientId) {
  console.error("( × ) MISSING CREDENTIALS // PLEASE CONFIGURE DISCORD_TOKEN AND CLIENT_ID IN .ENV");
  process.exit(1);
}

const commands = [];
const commandsDir = path.join(__dirname, "commands");

// Recursively find all command files across categories
function getCommandFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getCommandFiles(fullPath));
    } else if (file.endsWith(".js")) {
      results.push(fullPath);
    }
  }
  return results;
}

const commandFiles = getCommandFiles(commandsDir);

for (const filePath of commandFiles) {
  try {
    const commandModule = await import(pathToFileURL(filePath).href);
    if (commandModule.data && commandModule.execute) {
      commands.push(commandModule.data.toJSON());
    } else {
      console.warn(`[STANDBY] SKIPPING NON-COMMAND MODULE: ${path.basename(filePath)}`);
    }
  } catch (err) {
    console.error(`( × ) ERROR PARSING ${path.basename(filePath)}:`, err.message);
  }
}

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log(`( • ) NOTHING // DEPLOYING ${commands.length} GLYPH SLASH COMMANDS TO DISCORD...`);

    const data = await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    );

    console.log(`( ✓ ) CONFIRMED // SUCCESSFULLY REGISTERED ${data.length} APPLICATION (/) COMMANDS GLOBALLY!`);
  } catch (error) {
    console.error("( × ) GLYPH REGISTRATION FAILURE:", error);
  }
})();
