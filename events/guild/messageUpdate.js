module.exports = async (bot, oldMessage, newMessage) => {

	if(newMessage.channel.name === 'tmt-level-codes') {
		try {
		// emit the message like it was just submitted (will trigger the bot if conditions are met)
			bot.emit('message', newMessage);
		}
		catch (error) {
			console.error('Something went wrong when fetching the message:', error);
		}
	}
};