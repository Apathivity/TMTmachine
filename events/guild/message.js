const { prefix } = require('../../botConfig.json');
const usedCommand = new Set();

module.exports = async (bot, message) => {

	const channelName = ['tmt-level-codes', 'tmt-feedback', 'emt-codes', 'emt-final-review', 'bots-and-spam', 'commands', 'server-moderators', 'level-moderators', 'message_catch'];
	if (!channelName.includes(message.channel.name)) return;

	// When we receive a reaction we check if the message is partial or not
	{
		if(message.partial) {
			try { await message.fetch(); }
			catch (e) { console.error('Error reactionAdd - 001:', e); }
		}
	}

	if(message.author.bot || message.channel.type === 'dm') return;

	const args = message.content.slice(prefix.length).trim().split(/ +/g);
	const cmd = args.shift().toLowerCase();
	const skeleKey = message.reactions.cache.some(key => key.emoji.name === '🔑');
	try {
		const ifReview = [`${prefix}review`, `${prefix}Review`];

		if(message.content.startsWith('Course:') || message.content.startsWith('Name:')) {
			const courseFile = bot.commands.get('submit') || bot.commands.get(bot.aliases.get('submit'));
			if(courseFile) courseFile.run(bot, message, args);
		}
		else if(ifReview.some(word => message.content.includes(word)) || skeleKey && message.channel.name === 'tmt-feedback') {
			const reviewFile = bot.commands.get('review') || bot.commands.get(bot.aliases.get('review'));
			if(reviewFile) reviewFile.run(bot, message, args);
		}
		else if(message.content.startsWith(prefix)) {
			const commandFile = bot.commands.get(cmd) || bot.commands.get(bot.aliases.get(cmd));
			console.log('how many times');

			if(commandFile) {

				if(usedCommand.has(commandFile.config.name) && commandFile.config.name !== 'help');

				const access = commandFile.config.accessableby;
				const roleCheck = await message.guild.member(message.author).roles.cache.some(role => role.name === `${access}`);
				if(!roleCheck && !access === 'Members') return message.reply('This command has been used recently (30s cooldown)');

				commandFile.run(bot, message, args)
					.then(usedCommand.add(commandFile.config.name));
			}
			setTimeout(() => {
				usedCommand.delete(usedCommand);
			}, 30000);
		}
	}
	catch (error) {
		console.error(error);
		message.channel.send('message handler failed! - error /message-19/');
	}
};