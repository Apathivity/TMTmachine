// const { EMTembed } = require('./EMTembed');

module.exports = {

	config: {
		name: '❤️',
		description: 'Acts as a reaction upvote for EMT courses; liked a course? ❤️ it!',
		usage: 'heart',
		category: 'EMT',
		accessableby: '',
		aliases: [],
	},

	run: async (bot, reaction, user) => {

		// leave if not in the correct channel
		if(!reaction.message.channel.name === 'emt-codes') return;

		// Author may not heart their own submission
		const messageAuthor = reaction.message.author.id === user.id;
		if(messageAuthor) {
			reaction.users.remove(user.id);
			const selfHeart = await reaction.message.channel.send(`${user}, You may not :heart: your own course`);
			await selfHeart.delete({ timeout: 5000 });
			return;
		}

		// look for the heart cache, because direct calling returns 'NULL'
		const heartCount = await reaction.message.reactions.cache.find(e => e.emoji.name === '❤️').count;

		// If EMT submission reaches the :heart: threshold =>
		if(heartCount === 5) {
			// react with a special emoji to signify the heart threshold was reached
			reaction.message.react('👑');
			// find the final review channel
			const emtFinal = reaction.message.guild.channels.cache.find(channel => channel.name === 'emt-final-review');
			// if found, determine if the course is already posted
			if (emtFinal) {
				const emtSearch = await emtFinal.messages.fetch({ limit: 100 });
				const emtMsgDupe = await emtSearch.find(msg => msg.embeds[0].footer.text.startsWith(`${reaction.message.id}`));
				// if dupe found, leave
				if(emtMsgDupe) return;
				// otherwise, go post the Embed card
				try{
					const commandFile = bot.react.get('EMTembed');
					if (commandFile) commandFile.run(bot, reaction, user, emtFinal);
				}
				catch (e) { console.error('Error EMTembed - Missing final emt channel:', e); }
			}
			else { return (reaction.message.reply('session terminated: `No #emt-final-review channel found!`')); }
		}
		// if the course does not have enough hearts, leave
		else { return; }
		// reaction.message.channel.send('Red_Heart');
	},
};

