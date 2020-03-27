const { MessageEmbed } = require('discord.js');
const { cardBetaBoard } = require('../../guildConfig.json');
const { cardGoldBoard } = require('../../guildConfig.json');

module.exports = {

	config: {
		name: 'claims',
		description: 'Displays how recently each couse in all queues were posted',
		usage: '!claims',
		category: 'Text Commands',
		accessableby: 'TMT',
		aliases: ['claim', 'uptime', 'activity', 'wait'],
	},

	// eslint-disable-next-line no-unused-vars
	run: async (bot, message, user) => {

		message.delete();
		if(!message.member.roles.cache.some(role => role.name === 'TMT')) return message.reply('Only members with the TMT role may use this command').then(msg => msg.delete({ timeout: 5000 }));


		const embed = new MessageEmbed()
			.setColor('0x1919FF')
			.setAuthor('Most recent course activity, all queues', message.guild.iconURL())
			.setFooter(`© ${message.guild.me.displayName} | 2k20 v2.0`, bot.user.displayAvatarURL());


		// find the beta channel
		const betaChannel = message.guild.channels.cache.find(channel => channel.name === cardBetaBoard);
		const goldChannel = message.guild.channels.cache.find(channel => channel.name === cardGoldBoard);

		if (!betaChannel || !goldChannel) return message.channel.send('Missing critical channel (either beta or gold channel) - session terminated').then(msg => msg.delete({ timeout: 5000 }));


		// collect all embed messages (ignoring text messages)
		const betaList = await betaChannel.messages.fetch({ limit: 72 }).then(messages => {
			const msgBaseEmbed = messages.filter(msg => msg.embeds[0] && msg.embeds[0].title);
			return msgBaseEmbed;
		});
		// collect all embed messages (ignoring text messages)
		const goldList = await goldChannel.messages.fetch({ limit: 72 }).then(messages => {
			const msgBaseEmbed = messages.filter(msg => msg.embeds[0] && msg.embeds[0].title);
			return msgBaseEmbed;
		});

		embed.setFooter(`© ${message.guild.me.displayName} | 2k20 v2.0`, bot.user.displayAvatarURL());


		betaList.forEach((betaCard) => {

			const symbol = '🔷';
			const title = betaCard.embeds[0].title;
			const checkEmb = betaCard.embeds[0].title.startsWith('|');
			let newTitle = (/(⌈ \d-\d ⌋) (\w.*\S)(\n)(⬖ .* ⬗)/).exec(title);
			if(checkEmb) { newTitle = (/(\| \d-\d \|) (.*)(- .*-.*-.* -)/).exec(title); }

			const creator = betaCard.embeds[0].fields[0].value;
			const subTime = betaCard.embeds[0].timestamp;
			const date = new Date();
			const now = date.getTime();
			const length = (now - subTime);
			const convert = (((length / 1000) / 86400)).toFixed(2);

			embed.addField(`${symbol} ${newTitle[1]} ⬗ ${newTitle[2]}`, `days in queue: [[${convert}]](${betaCard.url} 'Go to queue card') | ${creator}`);
		});

		goldList.forEach((goldCard) => {

			const symbol = '🔶';
			const title = goldCard.embeds[0].title;
			const checkEmb = goldCard.embeds[0].title.startsWith('|');
			let newTitle = (/(⌈ \d-\d ⌋) (\w.*\S)(\n)(⬖ .* ⬗)/).exec(title);
			if(checkEmb) { newTitle = (/(\| \d-\d \|) (.*)(- .*-.*-.* -)/).exec(title); }

			const creator = goldCard.embeds[0].fields[0].value;
			const subTime = goldCard.embeds[0].timestamp;
			const date = new Date();
			const now = date.getTime();
			const length = (now - subTime);
			const convert = (((length / 1000) / 86400)).toFixed(2);

			embed.addField(`${symbol} ${newTitle[1]} ⬗ ${newTitle[2]}`, `days in queue: [[${convert}]](${goldCard.url} 'Go to queue card') | ${creator}`);
		});

		message.channel.send(embed);
	},
};

