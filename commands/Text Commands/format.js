const { codeSubBoard, botChannel } = require('../../guildConfig.json');

module.exports = {

	config: {
		name: 'format',
		description: 'Displays the required Project TMT course submission format.',
		usage: '!format',
		category: 'Text Commands',
		accessableby: 'TMT',
		aliases: [],
	},

	// eslint-disable-next-line no-unused-vars
	run: async (bot, message, user) => {
		message.delete();
		if(!message.channel.name === codeSubBoard || !message.channel.name === botChannel) return;
		try {
			message.channel.send('\nCourse:\nName:\nGimmick:\nCode:\nVersion:\n``` <Notes/Changelog> ```')
				.then(msg => msg.delete({ timeout: 60000 }));
		}
		catch (e) {
			console.error(e);
			message.channel.send('Course message regex failed - error /format - 001/');
		}
	},
};
