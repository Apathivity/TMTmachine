const { Client, Collection } = require('discord.js');
const { Token } = require('./botconfig.json');
const bot = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

['aliases', 'commands', 'react'].forEach(x => bot[x] = new Collection());
['console', 'command', 'event', 'reaction'].forEach(x => require(`./handlers/${x}`)(bot));

// Log in to Discord with token
bot.login(Token);