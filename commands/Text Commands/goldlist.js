const { MessageEmbed } = require('discord.js');
const { cardGoldBoard } = require('../../guildConfig.json');

module.exports = {

	config: {
		name: 'goldlist',
		description: 'Displays all gold queue cards in a condensed format',
		usage: '!goldlist',
		category: 'Text Commands',
		accessableby: 'TMT',
		aliases: ['goldqueue', 'listgold', 'listg', 'gold', 'g', 'glist'],
		lockout: true,
	},

	// eslint-disable-next-line no-unused-vars
	run: async (bot, message, user) => {
		message.delete();
		if(!message.member.roles.cache.some(role => role.name === 'TMT')) return message.reply('Only members with the TMT role may use this command').then(msg => msg.delete({ timeout: 5000 }));

		const embed = new MessageEmbed()
			.setColor('0xFF7519')
			.setAuthor('🔶 Gold Queue 🔶', message.guild.iconURL());

		// find the gold channel
		const goldChannel = message.guild.channels.cache.find(channel => channel.name === cardGoldBoard);

		// collect all embed messages (ignoring text messages)
		const goldList = await goldChannel.messages.fetch({ limit: 72 }).then(messages => {
			const msgBaseEmbed = messages.filter(msg => msg.embeds[0] && msg.embeds[0].title);
			return msgBaseEmbed;
		});

		embed.setFooter(`™ ${message.guild.me.displayName} | 2k20 v2.0`, bot.user.displayAvatarURL());

		goldList.forEach(courseCard => {
			const checkEmb = courseCard.embeds[0].title.startsWith('|');

			let title = '';
			let reviews = '';
			let creator = '';
			let opMsg = '';
			let version = '';
			let newTitle = '';

			console.log(checkEmb);

			if(checkEmb) {
				title = courseCard.embeds[0].title;
				reviews = courseCard.embeds[0].fields[2].value;
				creator = courseCard.embeds[0].fields[0].value;
				opMsg = courseCard.embeds[0].fields[1].value;
				version = (/(v\d{1,2}|v\?)/).exec(courseCard.embeds[0].footer.text);
				newTitle = (/(\| \d-\d \|) (.*)(- .*-.*-.* -)/).exec(title);

				embed.addField(`${newTitle[1]} ___${newTitle[2]}___ (${version[0]})`, `${newTitle[3]}\n${creator} | ${opMsg}\n${reviews}`);
			}
			else {
				title = courseCard.embeds[0].title;
				reviews = courseCard.embeds[0].fields[2].value;
				creator = courseCard.embeds[0].fields[0].value;
				opMsg = courseCard.embeds[0].fields[1].value;
				version = (/(v\d{1,2}|v\?)/).exec(courseCard.embeds[0].footer.text);
				newTitle = (/(⌈ \d-\d ⌋) (\w.*\S)(\n)(⬖ .* ⬗)/).exec(title);

				embed.addField(`${newTitle[1]} ___${newTitle[2]}___ (${version[0]})`, `${newTitle[4]}\n${creator} | ${opMsg}\n${reviews}`);
			}
		});
		message.channel.send(`Here are all the current Gold Courses in ${goldChannel}`, embed);
	},
};