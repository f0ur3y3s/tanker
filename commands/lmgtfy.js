const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lmgtfy')
		.setDescription(`Googles someone's dumbass question for them. How convenient!`)
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to google a question for.')
                .setRequired(true))
        .addStringOption(option =>
            option 
                .setName('question')
                .setDescription('The question to google.')
                .setRequired(true)
            ),
    async execute(interaction) {
        const targetUser = interaction.options.getMember('user');
        const question = interaction.options.getString('question');
        var link = "https://googlethatforyou.com?q=";
        link += encodeURIComponent(question);
		await interaction.reply(`Hey ${targetUser}, Let me google that for you!\n${link}`);
	},
};