const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const cron = require('node-cron');
const dayjs = require('dayjs')
const dotenv = require('dotenv');

dotenv.config();

const token = process.env.TOKEN;
const channelID = process.env.CHANNEL_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();


const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
        console.log(`Loaded ${command.data.name}`)
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

const API_URL = "http://localhost:5005/api/passcode"

function check_slingingai_passcode(){
    var final_passcode = "";
    try {
        const response = fetch(API_URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `${process.env.SHARED_LOCALHOST_SECRET}`,
            }
        });
        const passcode_response = response.text();
        const passcode_response_parsed = JSON.parse(passcode_response);
        final_passcode = passcode_response_parsed.passcode.trim();
    } catch (e) {
        console.error("Error: ", e);
        throw e;
    }
    client.channels.fetch(channelID).then((channel) => {
        var toSend = "";
        toSend += "🔑 The passcode for this week is: **";
        toSend += final_passcode;
        toSend += "**";
        channel.send(toSend);
    });
}

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
    cron.schedule('0 12 * * 0', () => {
        check_slingingai_passcode();
    });
    console.log("Starting cron job");
});

// Log in to Discord with your client's token
client.login(token);
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);
	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}
	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});