const { SlashCommandBuilder } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();

const API_URL = "http://localhost:5005/api/passcode"

module.exports = {
	data: new SlashCommandBuilder()
		.setName('getpasscode')
		.setDescription('Get the weekly passcode for SlingingAI.'),
	async execute(interaction) {
        try {
            const response = await fetch(API_URL, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `${process.env.SHARED_LOCALHOST_SECRET}`,
                }
            });
            const passcode_response = await response.text();
            const passcode_response_parsed = JSON.parse(passcode_response);
            await interaction.reply(`The passcode for this week is: **${passcode_response_parsed.passcode.trim()}**`);
        } catch (e) {
            console.error("Error: ", e);
            throw e;
        }
	},
};