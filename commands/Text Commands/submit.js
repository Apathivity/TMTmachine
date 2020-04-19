module.exports = {

	config: {
		name: 'submit',
		accessableby: 'TMT',
	},

	// eslint-disable-next-line no-unused-vars
	run: async (bot, message, args) => {

		// if(!message.member.roles.cache.some(role => role.name === 'TMT')) return;
		if(!message.channel.name === 'tmt-level-codes' || !message.channel.name === 'emt-codes') return;
		if(message.edits) { message.reactions.removeAll(); }

		// skeleton keys useable only by Mods -> this key will bypass the prefix and word check of a command
		const skeleKey = message.reactions.cache.some(key => key.emoji.name === '🔑');
		const skelePlay = message.reactions.cache.some(key => key.emoji.name === 'play');
		// console.log('I see a key in message', skeleKey);

		// Regex for finding course code information
		const courseTemp = {
			course 	: /(?<=(Course:.*|course:.*))([\d] ?- ?[\d])/,
			name 	: /(?<=Name: *|name: *)((\w)(.*)(\S))/,
			code 	: /(?<=Code:.*|code:.*)([\w]{3}-[\w]{3}-[\w]{3})/,
			version : /(?<=Version:.*|version:.*)(\d{1,2})/,
		};
		const { course, name, code, version } = courseTemp;

		// Constructed list of course code information, using the above Regex on the message text
		const Values = {
			Course : course.exec(message.content),
			Name : name.exec(message.content),
			Code : code.exec(message.content),
			Version : version.exec(message.content),
		};
		// eslint-disable-next-line prefer-const
		let { Course, Name, Code, Version } = Values;

		const missingAll = !Course && !Name && !Code && !Version;
		if(missingAll) return;

		let missCourse = '';
		let missName = '';
		let missCode = '';
		let missValue = '';

		if(message.channel.name === 'tmt-level-codes') {
			const missCritValue = !Course || !Name || !Code;
			const missNomValue = !Version;
			// If there is missing info, add in all the nessisary text
			if(!Course) { missCourse = '\n> The `Course` number is unreadable or missing'; }
			if(!Name) { missName = '\n> The `Name` of the course is unreadable or missing'; }
			if(!Code) { missCode = '\n> The course `Code` is unreadable or missing'; }
			if(!Version) { missValue = '> Since no `Version` number was found, Version will be `?`'; }

			if(missCritValue) {
				// Send the complete message warning that the format is wrong, and where it is wrong
				message.channel.send(`${message.author.username}, the message is not in the correct format: \`!format\`${missCourse}${missName}${missCode}\n${missValue}\n\`Edit your submission message with the missing information to try again.\``)
					.then(msg => msg.delete({ timeout: 30000 }))
					.catch(err => console.error('Error 328', err));
				return;
			}
			else if(!missCritValue || skeleKey || skelePlay) {
				if(missNomValue) { message.channel.send(`${missValue}\nIf you don't want the Version to be \`?\` you may edit the message to add in a Version number`).then(msg => msg.delete({ timeout: 15000 })); }
				message.react('🔷').then(message.react('🔶'));
			}
		}
		if(message.channel.name === 'emt-codes') {
			if(!Name && !Code) return;
			const missEMTValue = !Name || !Code;
			if(!Name) { missName = '\n> The `Name` of the course is unreadable or missing'; }
			if(!Code) { missCode = '\n> The course `Code` is unreadable or missing'; }

			if(missEMTValue) {
				message.channel.send(`${message.author.username}, the message is not in the correct format:${missName}${missCode}\n\`\`\`- Minimum requirements -\n\nName:<name of course>\nCode:<XXX-XXX-XXX>\`\`\``)
					.then(msg => msg.delete({ timeout: 30000 }))
					.catch(err => console.error('Error 328', err));
				return;
			}
			else if(!missEMTValue || !missEMTValue && skeleKey || !missEMTValue && skelePlay)  {
				message.react('❤️');
			}
		}

	},
};
