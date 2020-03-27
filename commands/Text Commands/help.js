const { MessageEmbed } = require('discord.js');
const { prefix } = require('../../botConfig.json');
const { readdirSync } = require('fs');
const { stripIndents } = require('common-tags');

module.exports = {
	config: {
		name: 'help',
		aliases: ['h', 'halp', 'wut', 'commands'],
		usage: '!help',
		category: 'Text Commands',
		description: 'Displays all commands that this bot has.',
		accessableby: 'Members',
		del: true,
	},
	run: async (bot, message, args) => {
		message.delete();
		const embed = new MessageEmbed()
			.setColor('0x00FFFF')
			.setAuthor(`${message.guild.me.displayName} Help`, message.guild.iconURL())
			.setThumbnail(bot.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }));

		if (!args[0]) {
			const categories = readdirSync('./commands/');

			embed.setDescription(`These are the avaliable commands for ${message.guild.me.displayName}\nThis bot's prefix is: **\`${prefix}\`**\n_Every text command has a 30sec cooldown_`);
			embed.setFooter(`© ${message.guild.me.displayName} | 2k20 v2.0`, bot.user.displayAvatarURL());

			categories.forEach(category => {
				const dir = bot.commands.filter(c => c.config.category === category);
				const capitalise = category.slice(0, 1).toUpperCase() + category.slice(1);
				const commands = dir.map(c => `\`${c.config.name}\``).join(' ');
				try {
					embed.addField('\u200B', `**⮛ ${capitalise} [${dir.size}] ⮛**\n${commands}`);
				}
				catch(e) {
					console.log(e);
				}
			});
			embed.addField('\u200B', '**⮛ Emoji Reaction Info Bellow [6] ⮛**');

			const msgEmbed = await message.channel.send(embed);
			await msgEmbed.react('🔷');
			await msgEmbed.react('🔶');
			await msgEmbed.react('❤️');
			await msgEmbed.react('👑');
			await msgEmbed.react('💖');
			await msgEmbed.react('🔑');
			return;
		}

		else {
			let command = bot.commands.get(bot.aliases.get(args[0].toLowerCase()) || args[0].toLowerCase());
			if(!command) return message.channel.send(embed.setTitle('Invalid Command.').setDescription(`Do \`${prefix}help\` for the list of the commands.`));
			command = command.config;

			embed.setDescription(stripIndents`This bot's prefix is: \` ${prefix} \`\n
            **Command:** ${command.name.slice(0, 1).toUpperCase() + command.name.slice(1)}
            **Description:** ${command.description || 'No Description provided.'}
            **Usage:** ${command.usage ? `\`${prefix}${command.name}\`` : 'No Usage'}
            **Accessible by:** ${command.accessableby || 'Members'}
            **Aliases:** ${command.aliases ? command.aliases.join(', ') : 'None.'}`);

			return message.channel.send(embed);
		}
	},
};

