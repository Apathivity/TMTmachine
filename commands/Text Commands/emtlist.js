const { MessageEmbed } = require('discord.js');

module.exports = {

	config: {
		name: 'emtlist',
		description: 'Displays all emt queue cards in a condensed format',
		usage: '!emtlist',
		category: 'Text Commands',
		accessableby: 'TMT',
		aliases: ['emtqueue', 'listemt', 'liste', 'emt'],
	},

	// eslint-disable-next-line no-unused-vars
	run: async (bot, message, user) => {
		message.delete();
		const embed = new MessageEmbed()
			.setColor('0xff0000')
			.setAuthor('❤️ EMT Submitted Courses ❤️', message.guild.iconURL())
			.setTimestamp(message.createdTimestamp)
			.setFooter(`© ${message.guild.me.displayName} | 2k20 v2.0`, bot.user.displayAvatarURL());

		// find the emt channel
		const emtChannel = message.guild.channels.cache.find(channel => channel.name === 'emt-codes');

		// collect all embed messages (ignoring text messages)
		const emtList = await emtChannel.messages.fetch({ limit: 100 }).then(messages => {
			const msgBaseEmbed = messages.filter(msg => msg.reactions.cache.some(heart => heart.emoji.name === '❤️'));
			return msgBaseEmbed;
		});

		emtList.forEach(async submission => {

			const emtName = /(?<=Name: *|name: *)((\w)(.*)(\S))/.exec(submission.content);
			const emtCode = /(?<=Code:.*|code:.*)([\w]{3}-[\w]{3}-[\w]{3})/.exec(submission.content);
			const creator = submission.author;
			const opMsg = submission.url;
			const hearts = submission.reactions.cache.find(e => e.emoji.name === '❤️').count;

			embed.addField('\u200B', `**__${emtName[0]}__**\nby ${creator}\nCode: ${emtCode[0]} \n❤️ : ${hearts}/5 || [Go give a Heart](${opMsg} '${creator}'s Course')`, true);

		});
		message.channel.send(`Here are all the current EMT Courses in ${emtChannel}`, embed);
	},
};