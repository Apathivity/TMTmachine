const fs = require('fs');

module.exports = {

	config: {
		name: 'test',
		accessableby: 'members',
	},

	// eslint-disable-next-line no-unused-vars
	run: async (bot, message, args) => {

		if(!args[0]) return message.channel.send('Please enter the name of a course creator after "+lookup');

		const courses = JSON.parse(fs.readFileSync('./courseList.json', 'utf8'));
		const claimList = [];

		// eslint-disable-next-line no-unused-vars
		Object.keys(courses).forEach((n, i) => {
			const v = courses[n];
			const creator = v[0].creator;

			console.log(args[0], creator);

			if(creator === args[0]) { claimList.push(n); }
			return;

		});

		if(!claimList[0]) { return message.channel.send(`No courses are claimed by **${args[0]}**`); }
		else {
			const trimList = claimList.toString().split(',').join(', ');
			message.channel.send(`Courses claimed by ${args[0]}: ${trimList}`);
		}
	},
};