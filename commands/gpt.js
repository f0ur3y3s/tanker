const { SlashCommandBuilder } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();

const API_KEY = process.env.OPENAI_API_KEY;
const API_URL = "https://api.openai.com/v1/chat/completions"

// non-streaming function
// async function generate_response(user_prompt){
//     try {
//         const response = await fetch(API_URL, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 Authorization: `Bearer ${API_KEY}`,
//             },
//             body: JSON.stringify({
//                 model: "gpt-4",
//                 messages: [
//                     { role: "system", content: "You are a helpful assistant who likes to keep their responses short, maximum length of 3-4 sentences."},
//                     { role: "user", content: user_prompt }
//                 ],
//             }),
//         });
//         const data = await response.json();
//         return data.choices[0].message.content;
//     } 
//     catch (error) {
//         console.error("Error:", error);
//         return "I'm sorry, I errored out. Please try again."
//     }
// }


async function processChunk(chunk) {
    const decoder = new TextDecoder("utf-8");
    const receivedChunk = decoder.decode(chunk);
    const splitChunk = receivedChunk.split('\n');
    const promises = splitChunk.map(async (line) =>  {
        if (line && !line.includes('[DONE]')) {
            const cleanedLine = line.replace('data: ', '').trim();
            try {
                const parsedLine = JSON.parse(cleanedLine);
                const { choices } = parsedLine;
                const { delta } = choices[0];
                const { content } = delta;
                if (content) {
                    return content;
                }
            } catch (e) {
                console.log(e);
            }
        }
        return '';
    });

    return await Promise.all(promises).then((contentLines) => {
        return contentLines.join('');
    });
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

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`,
                },
                body: JSON.stringify({
                    model: "gpt-4",
                    stream: true,
                    messages: [
                        { role: "system", content: "You are a helpful assistant who likes to keep their responses short, maximum length of 3-4 sentences."},
                        { role: "user", content: question }
                    ],
                })
            });
            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let result = `*Question:* ${question}\n\n`;
            await interaction.deferReply();
            while (true) {
                const { value: chunk, done } = await reader.read();
                if (done) {
                    break;
                }
                result += await processChunk(chunk);
                interaction.editReply(result);
            }
        } catch (e) {
            console.error("Error: ", e);
            throw e;
        }
	},
};