const { MessageEmbed } = require('discord.js');
module.exports = {
	config: {
		name: 'website',
		description: 'Gives a link to the Project TMT website',
		usage: '!website',
		category: 'Text Commands',
		accessableby: 'Members',
		aliases: ['tmtweb', 'tmtwebsite', 'tmtsite'],
	},

	run: async (bot, message) => {

		message.delete();

		const embed = new MessageEmbed()
			.setColor('0xe5cf33')
			.setTitle('Project TMT Website')
			.setDescription('Traditional Makers Team\'s official website.\nLearn more about our project(s) and any special early access content.')
			.setURL('https://projecttmt.com/')
			.setThumbnail('https://i.imgur.com/vF5mG8U.png');

		message.channel.send(embed);
	},
};