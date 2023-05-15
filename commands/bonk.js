const { SlashCommandBuilder, EmbedBuilder  } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bonk')
		.setDescription('Bonks someone.')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('The user to bonk.')
                .setRequired(true)),
	async execute(interaction) {
        // const targetUser = interaction.options.getUser('target');
        const targetUser = interaction.options.getMember('target');
        const exampleEmbed = new EmbedBuilder()
            .setColor(0x000000)
            .setDescription(`Bonked ${targetUser}!`)
            .setImage('https://c.tenor.com/tvSkixRvwsMAAAAC/bonk-meme.gif')
        await interaction.reply({ embeds: [exampleEmbed] });
	},
};