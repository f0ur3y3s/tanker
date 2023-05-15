const { SlashCommandBuilder } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();

const API_KEY = process.env.OPENAI_API_KEY;
const API_URL = "https://api.openai.com/v1/chat/completions"

async function generate_response(user_prompt){
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [
                    { role: "system", content: "You are a helpful assistant who likes to keep their responses short, maximum length of 3-4 sentences."},
                    { role: "user", content: user_prompt }
                ],
            }),
        });
        const data = await response.json();
        return data.choices[0].message.content;
    } 
    catch (error) {
        console.error("Error:", error);
        return "I'm sorry, I errored out. Please try again."
    }
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ask')
		.setDescription('Ask GPT-4 a question.')
        .addStringOption(option =>
            option
                .setName('question')
                .setDescription('The question to ask.')
                .setRequired(true)
        ),
	async execute(interaction) {
        const question = interaction.options.getString('question');
        await interaction.deferReply();
        const response = `*Question:* ${question}\n\n*Answer:* ${await generate_response(question)}`;
        
        await interaction.editReply(response);
	},
};