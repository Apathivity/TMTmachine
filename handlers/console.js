module.exports = (bot) => {
	const prompt = process.openStdin();
	prompt.addListener('data', res => {
		const x = res.toString().trim().split(/ +/g);
		bot.channels.cache.get('626184821990883338').send(x.join(' '));
	});
};