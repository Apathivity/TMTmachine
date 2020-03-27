const reactHelp = require('../../reaction_help.json');
const talkedRecently = new Set();
module.exports = async (bot, reaction, user) => {

	if (user.bot) return;

	const channelName = ['tmt-level-codes', 'tmt-feedback', 'emt-codes', 'emt-final-review', 'bots-and-spam', 'commands'];
	if (!channelName.includes(reaction.message.channel.name)) return;

	if (reaction.message.partial) {
		try { await reaction.message.fetch(); }
		catch (e) { console.error('Error reactionAdd - 001:', e); }
	}
	if (reaction.partial) {
		try { await reaction.fetch(); }
		catch (e) { console.error('Error reactionAdd - 002:', e);}
	}

	const reactUser = reaction.message.guild.member(user);
	const lvlMod = reactUser.roles.cache.some(role => role.name === 'Level Moderator');
	const messageAuthor = reaction.message.author.id === user.id;
	const botMsg = reaction.message.author.bot;
	const emoji = reaction._emoji.name;

	if (!botMsg && !messageAuthor && !lvlMod && emoji !== '❤️') return console.log('lockoutOverkill');

	let botFooter = false;

	if(reaction.message.embeds[0]) {
		const botEmbed = await reaction.message.embeds[0].footer.text;
		if (botEmbed === '© TMTmachine | 2k20 v2.0') {
			botFooter = true;
		}
	}

	const allEmojis = ['🔑', '❤️', '🔷', '🔶', '👑', '💖'];
	const findEmoji = ['🔑', '❤️', '🔷', '🔶'];

	try {
		if (findEmoji.includes(emoji) && botFooter === false) {
			const commandFile = bot.react.get(emoji);
			if (commandFile) commandFile.run(bot, reaction, user, lvlMod);
		}
		else if (allEmojis.includes(emoji) && botFooter === true) {

			switch (emoji) {
			case '🔑':
				if(talkedRecently.has('🔑')) return;
				reaction.message.channel.send(reactHelp.key);
				break;
			case '❤️':
				if(talkedRecently.has('❤️')) return;
				reaction.message.channel.send(reactHelp.heart);
				break;
			case '🔷':
				if(talkedRecently.has('🔷')) return;
				reaction.message.channel.send(reactHelp.beta);
				break;
			case '🔶':
				if(talkedRecently.has('🔶')) return;
				reaction.message.channel.send(reactHelp.gold);
				break;
			case '👑':
				if(talkedRecently.has('👑')) return;
				reaction.message.channel.send(reactHelp.crown);
				break;
			case '💖':
				if(talkedRecently.has('💖')) return;
				reaction.message.channel.send(reactHelp.sHeart);
				break;
			default:
				reaction.message.channel.send('Session terminated, something went wrong - `Error: help_emoji-001`');
				break;
			}
			talkedRecently.add(reaction.emoji.name);
			setTimeout(() => {
				talkedRecently.delete(reaction.emoji.name);
			}, 60000);
		}
	}
	catch (e) { console.error('ReactionAdd error - 03', e); }


	// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

	// For EMT final review (mods only)
	const msgReact = reaction.message;
	if (reaction.message.channel.name === 'emt-final-review') {

		const author = reaction.message.embeds[0].fields[0].value === `<@${user.id}>`;
		if (author) {
			await reaction.users.remove(user.id);
			const notAllowed = await reaction.message.channel.send(`${user}, You are not allowed approve/deny your own course`);
			await notAllowed.delete({ timeout: 10000 });
			return;
		}

		const updateChannel = msgReact.guild.channels.cache.find(channel => channel.name === 'emt-updates');
		const embCourseName = msgReact.embeds[0].title.split('| ');

		if (emoji === '✅') {
			await msgReact.delete();
			await updateChannel.send(`✅ Congratulations ${msgReact.embeds[0].fields[0].value}, your course \`${embCourseName[1]}\` was approved by ${user.username}! - It is now officially a part of **Project EMT**!`);
		}
		else if (emoji === '❌') {
			await msgReact.delete();
			await updateChannel.send(`❌Unfortunately ${msgReact.embeds[0].fields[0].value}, your course \`${embCourseName[1]}\` was rejected by ${user.username}. - Please speak to them with any questions you may have regarding this decision`);
		}
	}
};