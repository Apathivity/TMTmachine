const { MessageEmbed } = require('discord.js');
const { cardBetaBoard, cardGoldBoard, codeRevBoard } = require('../../guildConfig.json');

module.exports = {
	config: {
		name: 'review',
		description: 'Prompt for TMTmachine to add the message to the corosponding course queue card.',
		usage: '!review',
		category: 'Text Commands',
		accessableby: 'Level Revewers',
		aliases: ['review', 'Review'],
	},
	// eslint-disable-next-line no-unused-vars
	run: async (bot, message, args) => {

		const skeleKey = message.reactions.cache.some(key => key.emoji.name === '🔑');

		try{
			const lvlMod = await message.guild.member(message.author).roles.cache.some(role => role.name === 'Level Moderator');
			const lvlRev = await message.guild.member(message.author).roles.cache.some(role => role.name === 'Level Reviewers');
			// If the user does not have the appropriate role, exit
			if(!lvlMod && !lvlRev && !skeleKey) {
				return message.reply('Course review will not be added, as you do not have the appropriate role\nA Level Mod may override this with :key:')
					.then(msg => msg.delete({ timeout: 15000 }))
					.catch(err => console.error(err));
			}
		}
		catch { (e => console.error(e)); }

		const cardBetaChannel = message.guild.channels.cache.find(channel => channel.name === cardBetaBoard);
		const cardGoldChannel = message.guild.channels.cache.find(channel => channel.name === cardGoldBoard);
		const commandMsg = message.content.toLowerCase();

		// If review is in the wrong channel, leave
		if(message.channel.name !== codeRevBoard) return;

		// If there is a missing channel, or no channel found - let the user know
		if(!cardBetaChannel || !cardGoldChannel || !cardBetaChannel && !cardGoldChannel) {
			let queueChannel = 'Beta queue channel';
			if (!cardGoldChannel && cardBetaChannel) { queueChannel = 'Gold queue channel'; }
			else if(!cardGoldChannel && !cardBetaChannel) { queueChannel = 'Gold and Beta queue channels'; }
			else { queueChannel = 'Beta queue channel'; }
			return message.channel.send(`Session terminated: No ${queueChannel} found!`)
				.then(msg => msg.delete({ timeout: 15000 }))
				.catch(err => console.error(err));
		}

		// figure out what course the review is about by reading the course number (first one in the message)
		const findCourse = /([1-9])-([1-9])|([1-9]) +- +([1-9])/.exec(commandMsg);

		// If no course number was found, let the user know this and what to do next
		if (!findCourse) {
			return message.channel.send('Session Terminated: No course tag <world-level> found in review.')
				.then((msg) => msg.delete({ timeout: 10000 }))
				.catch(err => console.error('something went wrong finding a course tag - error 74', err));
		}
		// Grab the last 72 embeds in that channel
		const fetchBetaCard = await cardBetaChannel.messages.fetch({ limit: 72 }).then(messages => {
			const msgBetaEmbed = messages.filter(msg => msg.embeds[0] && msg.embeds[0].title);
			return msgBetaEmbed;
		});
		const fetchGoldCard = await cardGoldChannel.messages.fetch({ limit: 72 }).then(messages => {
			const msgGoldEmbed = messages.filter(msg => msg.embeds[0] && msg.embeds[0].title);
			return msgGoldEmbed;
		});
			// Fetch the embed card that has the corsponding course code
		const embBetaCard = await fetchBetaCard.find(m => m.embeds[0].title.startsWith(`⌈ ${findCourse[0]}`));
		const embGoldCard = await fetchGoldCard.find(m => m.embeds[0].title.startsWith(`⌈ ${findCourse[0]}`));
		// If no card was found, notify user of this
		if (!embBetaCard && !embGoldCard) {
			return message.channel.send(`No course card for \`[${findCourse[0]}]\` found in either ${cardBetaChannel} or ${cardGoldChannel}...`)
				.then((msg) => msg.delete({ timeout: 10000 }))
				.catch(err => console.error('something went wrong finding a card - error 85', err));
		}

		// determine which channel to message/edit
		let embCard = embBetaCard;
		if(!embBetaCard) { embCard = embGoldCard; }

		// If the reviewer is also the creator of the course, exit
		if(embCard.embeds[0].fields[0].value === `<@${message.author.id}>` && message.author.id !== '163069122601680896') {
			return message.reply('You may not review your own course.')
				.then(msg => msg.delete({ timeout: 10000 }))
				.catch(err => console.error(err));
		}
		// Check to see if the review has already been added to a course card, exit out if it has
		const reviewList = `${embCard.embeds[0].fields[2].value}`;
		const reviewDupe = (`${reviewList}`).search(`${message.url}`);
		if(reviewDupe !== -1) return;

		// If a card is found, add the review to the review section (as an embed)
		if(embCard) {

			const courseTitle = /(((⌈|\|) \d-\d (⌋|\|))(\W.*))/.exec(`${embCard.embeds[0].title}`);

			const botMessage = await message.channel.send(`${message.author.username}, is this review for \`${courseTitle[0]}\`?`);
			await botMessage.react('✅');
			await botMessage.react('❌');

			const filter = (react, creator) => {
				const reactUser = message.guild.members.cache.get(creator.id);
				const userBypass = reactUser.roles.cache.some(role => role.name === 'Level Moderator');
				if(creator.bot) return;
				return ((['✅', '❌'].includes(react.emoji.name) && creator.id === message.author.id) || (['✅', '❌'].includes(react.emoji.name) && userBypass));
			};

			const collected = await botMessage.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
				.catch(() => {
					botMessage.edit('Time limit exceeded - session terminated...')
						.then(botMessage.delete({ timeout : 5000 }));
					return;
				});
			try{

				const response = collected.first();
				botMessage.reactions.removeAll();

				// if no, exit the block and send a message that it was canceled
				if(response.emoji.name === '❌') return botMessage.edit('OK, session terminated...').then(botMessage.delete({ timeout: 5000 }));
				// if yes, edit the card with the review url (REVIEWER - REVIEW_URL)
				if(response.emoji.name === '✅') {

					if(embCard.channel.name === cardGoldBoard) {
					
						const questTwo = await botMessage.edit('OK great!. Now, is this course Approved? ✅ or Rejected? ❌');
						await questTwo.react('✅');
						await questTwo.react('❌');


						const fltr = (react, creator) => {
							const reactUser = message.guild.members.cache.get(creator.id);
							const userBypass = reactUser.roles.cache.some(role => role.name === 'Level Moderator');
							if(creator.bot) return;
							return (['✅', '❌'].includes(react.emoji.name) && creator.id === message.author.id || (['✅', '❌'].includes(react.emoji.name) && userBypass));
						};

						botMessage.awaitReactions(fltr, { max: 1, time: 60000, errors: ['time'] })
							.then((clcted) => {
								const rResponse = clcted.first();
								let Acceptance = '❌';

								// if yes, mark the review as approved
								if(rResponse.emoji.name === '✅') {
									Acceptance = '✅';
								}
								botMessage.reactions.removeAll();


								botMessage.edit(`OK, adding the review to the \`${courseTitle[1]}\` course card...`);
								setTimeout(() => {
									const oldReview = embCard.embeds[0].fields[2].value;
									const newReview = `[${Acceptance}](${message.url} 'To ${message.author.username}'s Review')`;

									if(oldReview.startsWith('🚫')) {
										embCard.embeds[0].fields[2].value = `[${Acceptance}](${message.url} 'To ${message.author.username}'s Review')`;
									}
									else {
										embCard.embeds[0].fields[2].value = `${oldReview} | ${newReview}`;
									}
									embCard.edit(new MessageEmbed(embCard.embeds[0]));

									botMessage.edit('Done!')
										.then(botMessage.delete({ timeout: 4000 }))
										.catch(err => console.error(err));
									message.react('🌟')
										.then(message.react(`${Acceptance}`));
								}, 4000);
							}).catch(() => {
								botMessage.edit('Time limit exceeded - session terminated...')
									.then(botMessage.delete({ timeout : 5000 }));
								return;
							});
					}
					// If the review is for a beta card =>
					if(embCard.channel.name === cardBetaBoard) {
						botMessage.edit(`OK, adding the review to the \`${courseTitle[1]}\` course card...`);
						setTimeout(() => {
							const oldReview = embCard.embeds[0].fields[2].value;
							const newReview = `[📝](${message.url} 'To ${message.author.username}'s Review')`;

							if(oldReview.startsWith('🚫')) {
								embCard.embeds[0].fields[2].value = `[📝](${message.url} 'To ${message.author.username}'s Review')`;
							}
							else {
								embCard.embeds[0].fields[2].value = `${oldReview} | ${newReview}`;
							}
							embCard.edit(new MessageEmbed(embCard.embeds[0]));

							botMessage.edit('Done!')
								.then(botMessage.delete({ timeout: 5000 }))
								.then(message.react('🌟'))
								.catch(err => console.error(err));
							return console.log('beta end');
						}, 5000);
					}
				}
			}
			catch {err => console.error(err);}

		}
	},
};