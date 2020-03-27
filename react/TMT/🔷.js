module.exports = {

	config: {
		name: '🔷',
		description: 'Flags a course submission as Beta',
		usage: 'large_blue_diamond',
		category: 'TMT',
		accessableby: 'TMT',
		aliases: [],
	},

	// eslint-disable-next-line no-unused-vars
	run: async (bot, reaction, user, lvlMod) => {

		try {
			const addedQueue = reaction.message.reactions.cache.find(e => e.emoji.name === '✅');
			if (addedQueue) {
				const findBot = addedQueue.me;
				if (findBot) { return reaction.message.reply('This course has already been added to the queue').then(msg => msg.delete({ timeout: 10000 })); }
			}
		}
		catch { (e => console.log(e)); }

		if (!user.id === reaction.message.author.id && !lvlMod) return;
		if (!reaction.message.channel.name === 'tmt-level-codes') return;

		try {
			await reaction.users.remove('679116712972517389');
			if (reaction.message.reactions.cache.find(e => e.emoji.name === '🔶')) {
				await reaction.message.reactions.cache.find(e => e.emoji.name === '🔶').users.remove();
			}
		}
		catch (error) { console.error('Blue_Diamond -', error); }

		try{
			const commandFile = bot.react.get('TMTembed');
			if (commandFile) commandFile.run(bot, reaction, user);
		}
		catch { (e => console.error('Error EMTembed - Missing final emt channel:', e)); }
		// reaction.message.channel.send('Blue_Diamond');
	},
};