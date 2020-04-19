const { MessageEmbed } = require('discord.js');
const { cardBetaBoard, cardGoldBoard } = require('../../guildConfig.json');
const fs = require('fs');

module.exports = {

	config: { name: 'TMTembed' },

	run: async (bot, reaction, user) => {

		if(!reaction.message.channel.name === 'tmt-level-codes') return;

		// What is the emoji?
		const emoji = reaction.emoji.name;

		const pingBeta = reaction.message.guild.roles.cache.get(`701437415482589205`);
		const pingGold = reaction.message.guild.roles.cache.get(`701437528531796068`);

		// find the gold and beta channels
		const betaChannel = reaction.message.guild.channels.cache.find(channel => channel.name === cardBetaBoard);
		const goldChannel = reaction.message.guild.channels.cache.find(channel => channel.name === cardGoldBoard);

		let symbol = '🔷';
		let baseQueue = betaChannel;
		let polarQueue = goldChannel;
		let reviewPing = pingBeta;

		if(emoji === '🔶') {
			symbol = '🔶';
			baseQueue = goldChannel;
			polarQueue = betaChannel;
			reviewPing = pingGold;
		}

		// Constructed list of course code information, using Regex on the message text
		const Course = (/(?<=(Course:.*|course:.*))([\d] ?- ?[\d])/).exec(reaction.message.content);
		const Name = (/(?<=Name: *|name: *)((\w)(.*)(\S))/).exec(reaction.message.content);
		const Code = (/(?<=Code:.*|code:.*)([\w]{3}-[\w]{3}-[\w]{3})/).exec(reaction.message.content);
		let Version = (/(?<=Version:.*|version:.*)(\d{1,2})/).exec(reaction.message.content);

		if (!Version) Version = '?';

		// Attempt to change the color of the embed (default is grey) =>
		const worldColor = JSON.parse(fs.readFileSync('./worldcolors.json', 'utf8'));
		let embColor = '0xcccccc';
		const regexWorld = (`${parseInt(Course[0])}`);
		if(worldColor[regexWorld]) { embColor = (worldColor[regexWorld]); }

		// Create the embed
		const embed = new MessageEmbed()
			.setColor(embColor)
			.setTitle(`⌈ ${Course[0]} ⌋ ${Name[0]}\n⬖ ${Code[0]} ⬗ `)
			.addField('__Creator__', reaction.message.author, true)
			.addField('__Message__', `[Jump To](${reaction.message.url} '${reaction.message.author.username}'s Course')`, true)
			.addField('__Reviews__', '🚫', true)
			.setTimestamp(reaction.message.createdTimestamp)
			.setFooter(`${symbol} | v${Version[0]} | ${reaction.message.id}`);

		if(!baseQueue) {
			return reaction.message.channel.send(`I could not find a ${baseQueue}; Session terminated...`)
				.then(msg => msg.delete({ timeout: 10000 }));
		}

		// grab the first 72 cards in the /base/ card channel
		const embBase = await baseQueue.messages.fetch({ limit: 72 }).then(messages => {
			const msgBaseEmbed = messages.filter(msg => msg.embeds[0] && msg.embeds[0].title);
			return msgBaseEmbed;
		});
			// grab the first 72 cards in the /polar/ card channel
		const embPolar = await polarQueue.messages.fetch({ limit: 72 }).then(messages => {
			const msgPolarEmbed = messages.filter(msg => msg.embeds[0] && msg.embeds[0].title);
			return msgPolarEmbed;
		});

		// find the /base/ and /polar/ card with the same ID as the message id (this may return false)
		const baseDupeCard = await embBase.find(m => m.embeds[0].title.startsWith(`⌈ ${Course[0]}`)) || await embPolar.find(m => m.embeds[0].title.startsWith(`| ${Course[0]}`));
		const polarDupeCard = await embPolar.find(m => m.embeds[0].title.startsWith(`⌈ ${Course[0]}`)) || await embPolar.find(m => m.embeds[0].title.startsWith(`| ${Course[0]}`));

		if(baseDupeCard && polarDupeCard) {
			return reaction.message.channel.send(`There is a course card in both ${betaChannel} and ${goldChannel}, please remove at least one and try again.`)
				.then(msg => msg.delete({ timeout : 4000 }));
		}

		if(baseDupeCard || polarDupeCard) {

			let dupeCard = baseDupeCard;
			let cardChannel = baseQueue;
			if(polarDupeCard) {
				dupeCard = polarDupeCard;
				cardChannel = polarQueue;
			}

			try {
				// ask if they want to replace the old card using this message
				reaction.message.channel.send(`${user.username}, \`[${Course[0]}] ${Name[1]}\` is already queued in ${cardChannel}: Would you like to submit a new version?`)
					.then((botMessage) => {
						botMessage.react('✅')
							.then(() => botMessage.react('❌'))
							.catch((err) => console.error('one of the emojies failed to react - error 350', err));

						const filter = (react, creator) => {
							const reactUser = reaction.message.guild.members.cache.get(creator.id);
							const userBypass = reactUser.roles.cache.some(role => role.name === 'Level Moderator');
							if(creator.bot) return;
							return (['✅', '❌'].includes(react.emoji.name) && creator.id === reaction.message.author.id || (['✅', '❌'].includes(react.emoji.name) && userBypass));
						};
						botMessage.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
							.then((collected) => {
								const reactResponse = collected.first();

								botMessage.reactions.removeAll();

								if(reactResponse.emoji.name === '✅') {
									botMessage.edit(`Ok, adding the new version for \`${Course[0]}\` to ${baseQueue}...`);
									// send the MessageEmbed message to the beta channel
									try{
										// send created embed to the appropriate channel
										baseQueue.send(`${reviewPing}`, { embed });
									}
									catch (e) { console.error('Error EMTembed - Missing final emt channel:', e); }

									// add a checkmark emoji to the message
									reaction.message.react('✅')
										.then(async () => {
											// Take the queue card and pull out the id of the OP message
											const footArray = dupeCard.embeds[0].footer.text.split(' | ');
											// grab the course submit channel
											const codeChannel = reaction.message.guild.channels.cache.find(channel => channel.name === 'tmt-level-codes');
											// grab 100 messages in the code submit channel
											const fetchOld = await codeChannel.messages.fetch({ limit: 100 });
											// find the old message using id
											const exOutOld = fetchOld.find(msg => msg.id === footArray[2]);
											const exOutNew = fetchOld.find(msg => msg.id === footArray[1]);
											const oldCard = /(\d{18})/.exec(exOutOld);
											const newCard = /(\d{18})/.exec(exOutNew);

											// if the message exists, perform the following.
											if (oldCard && oldCard !== reaction.message.id) {
												try {
													// Remove all reactions on the found OP message
													exOutOld.reactions.removeAll()
														// Then add an X to signify it's outdated and no longer in the queue
														.then(exOutOld.react('❌'));
												}
												catch { (e => console.error(e)); }
											}
											else if (newCard && newCard !== reaction.message.id) {
												try {
													// Remove all reactions on the found OP message
													exOutNew.reactions.removeAll()
														// Then add an X to signify it's outdated and no longer in the queue
														.then(exOutNew.react('❌'));
												}
												catch { (e => console.error(e)); }
											}
										}); setTimeout(function() {
										botMessage.edit(`\`[${Course[0]}] ${Name[1]}\` has been successfully updated!`)
											.then(msg => msg.delete({ timeout: 4000 }))
											.catch((err) => console.error(err));
									}, 2000);

									// delete old embed card (bye!)
									return dupeCard.delete().catch(err => console.error('Error - 362', err));
								}
								// If the reaction is an X - remove the bot message and reset the reactions
								else {
									botMessage.edit('Submission canceled - resetting reactions...')
										.then(reaction.message.reactions.removeAll())
										.then(reaction.message.react('🔷'))
										.then(reaction.message.react('🔶'))
										.catch((err) => console.error(err));
									setTimeout(function() {
										botMessage.edit('Done.')
											.then(botMessage.delete({ timeout: 4000 }))
											.catch((err) => console.error(err));
									}, 4000);
									return;
								}
							})
							.catch(() => {
								botMessage.reactions.removeAll();
								reaction.message.reactions.removeAll()
									.then(reaction.message.react('🔷')
										.then(rect => rect.message.react('🔶')));
								botMessage.edit('Time limit exceeded - session terminated...')
									.then(botMessage.delete({ timeout: 4000 }))
									.catch(err => console.error('Error - 209', err));
								return;
							});
					});
			}
			catch (e) { console.error(e); }
		}

		// If TMTbot does not find an embed card for the course =>
		if (!baseDupeCard && !polarDupeCard) {
			// confirm that the user wants to post message; check for yes, X for no
			reaction.message.channel.send(`${user.username}, do you want to add \`[${Course[0]}] ${Name[1]}\` to ${baseQueue}?`)
				.then((botMessage) => {
					botMessage.react('✅')
						.then(() => botMessage.react('❌'))
						.catch((err) => console.error('one of the emojies failed to react - error 80', err));

					const filter = (react, creator) => {
						const reactUser = reaction.message.guild.members.cache.get(creator.id);
						const userBypass = reactUser.roles.cache.some(role => role.name === 'Level Moderator');
						if(creator.bot) return;
						return (['✅', '❌'].includes(react.emoji.name) && creator.id === reaction.message.author.id || (['✅', '❌'].includes(react.emoji.name) && userBypass));
					};

					botMessage.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
						.then((collected) => {
							const removeResponse = collected.first();
							botMessage.reactions.removeAll();
							try {
								if(removeResponse.emoji.name === '✅') {
									botMessage.edit(`OK! Adding new course card of \`${Course[0]}\` to ${baseQueue}...`);
									// send the embed to the beta channel
									baseQueue.send(`${reviewPing}`, { embed });

									// message user that it's done => react with checkmark on message
									setTimeout(function() {
										botMessage.edit(`\`[${Course[0]}] ${Name[1]}\` has been added to ${baseQueue}!`)
											.then(reaction.message.react('✅'))
											.then(msg => msg.delete({ timeout: 6000 }))
											.catch(err => console.error('Error - 137', err));
									}, 2000);
								}
								else {
									return botMessage.edit(`${baseQueue} removal canceled - session terminated.`)
										.then(botMessage.delete({ timeout: 4000 }))
										.catch((err) => console.error('Remove card failed - error 266', err));
								}
							}
							catch (error) {
								console.error(error);
								reaction.message.channel.send('Remove reaction failed - error 273');
							}
						})
						.catch(() => {
							botMessage.reactions.removeAll()
								.then(reaction.message.reactions.removeAll())
								.then(reaction.message.react('🔷')
									.then(msg => msg.message.react('🔶')));
							botMessage.edit('Time limit exceeded - session terminated...')
								.then(botMessage.delete({ timeout: 4000 }))
								.catch(err => console.error('Error - 209', err));
							return;
						});
				});
		}
	},
};