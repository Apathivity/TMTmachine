const { Dev } = require('../../guildConfig.json');
module.exports = {

	config: {
		name: '🔑',
		description: 'Reaction used to bypass most of TMTmachine\'s rules - A skeleton key',
		usage: 'key',
		category: 'Mod',
		accessableby: 'Level Moderators',
		aliases: [],
	},

	// eslint-disable-next-line no-unused-vars
	run: async (bot, reaction, user, lvlMod) => {

		reaction.users.remove(user.id);

		try {
			// if not a Level Moderator, leave
			if(!lvlMod && user.id !== Dev) return reaction.message.reply(':key: is reserved for Level Moderators only').then(msg => msg.delete({ timeout: 5000 }));

			const channelName = ['tmt-feedback', 'tmt-level-codes', 'emt-codes'];
			const currentChannel = reaction.message.channel.name;

			// const reviewFile = bot.commands.get('review');
			// const tmtFile = bot.react.get('TMTembed');
			const emtFile = bot.react.get('EMTembed');

			if(channelName.includes(currentChannel)) {
				switch (currentChannel) {
				case 'tmt-feedback':

					reaction.message.react('✨');
					bot.emit('message', reaction.message);

					break;
				case 'tmt-level-codes':

					reaction.message.reactions.removeAll();
					reaction.message.react('🔷')
						.then(msg => msg.message.react('🔶'))
						.then(msg => msg.message.react('🛠️'));

					break;

				case 'emt-codes':
					if(reaction.message.author.id === user.id) return reaction.message.reply('You may not skeleKey your own course').then(msg => msg.delete({ timeout: 5000 }));
					// react with a special heart to signify a skelekey was used
					reaction.message.react('💖');
					// go run the EMT embed code =>
					if(emtFile) emtFile.run(bot, reaction, user);

					break;
				default: bot.emit('message', reaction.message);
				}
			}
			// console.log('the Key got to the emit section');
		}
		catch (error) {
			reaction.message.channel.send('Something went wrong - Error 003');
			console.error('Something went wrong - Error reactionAdd - 003: ', error);
		}
	},
};