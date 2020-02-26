import * as Discord from 'discord.js';
import { run } from './processor/roll'

const client = new Discord.Client();
const rollRegex = /!roll (.*)/;
const TOKEN = process.env.TOKEN;
export const DICE_SERVICE = process.env.DICE;

client.on('ready', () => {
  console.log('Bot is ready!');
});

client.on('message', (message) => {
  const match = message.content.match(rollRegex);
  if (match) {
    run(match[1], message);
  }
});

if (!TOKEN) {
  throw new Error('Missing "TOKEN" environment variable.');
}
else if (!DICE_SERVICE) {
  throw new Error('Missing "DICE" environment variable.')
} else {
  client.login(TOKEN).then();
}
