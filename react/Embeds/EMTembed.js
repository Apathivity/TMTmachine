const { MessageEmbed } = require('discord.js');

module.exports = {

	config: { name: 'EMTembed' },

	run: async (bot, reaction) => {

		const emtFinal = reaction.message.guild.channels.cache.find(channel => channel.name === 'emt-final-review');

		const emtName = /(?<=Name: *|name: *)((\w)(.*)(\S))/.exec(reaction.message.content);
		const emtCode = /(?<=Code:.*|code:.*)([\w]{3}-[\w]{3}-[\w]{3})/.exec(reaction.message.content);
		const embed = new MessageEmbed()
			.setColor('0xff0000')
			.setTitle(`❤️ | ${emtName[0]} - ${emtCode[0]} -`)
			.addField('__Creator__', reaction.message.author, true)
			.addField('__Message__', `[Jump To](${reaction.message.url} '${reaction.message.author.username}'s Course')`, true)
			.setTimestamp(reaction.message.createdTimestamp)
			.setFooter(`${reaction.message.id}`);

		try{
			emtFinal.send(embed)
				.then((emtMsg) => {
					emtMsg.react('✅')
						.then(emtMsg.react('❌'));
				});
		}
		catch (e) { console.error('Error EMTembed - Missing final emt channel:', e); }
	},
};
