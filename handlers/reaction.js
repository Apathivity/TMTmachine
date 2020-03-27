const { readdirSync } = require('fs');

module.exports = (bot) => {
	const load = dirs => {
		const events = readdirSync(`./react/${dirs}/`).filter(d => d.endsWith('.js'));
		for(const file of events) {
			const pull = require(`../react/${dirs}/${file}`);
			bot.react.set(pull.config.name, pull);
		}
	};
	['EMT', 'Mod', 'TMT', 'Embeds'].forEach(x => load(x));
};