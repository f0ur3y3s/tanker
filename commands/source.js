const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('source')
		.setDescription('Displays the github repo of the bot.'),
	async execute(interaction) {
        var toSend = `Made with love by f0ur3y3s\nhttps://github.com/incub4t0r/tanker`;
		await interaction.reply(toSend);
	},
};