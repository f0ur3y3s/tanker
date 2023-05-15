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


function calculateDays(){
    var toSend = ``;
    var now = dayjs();
    var grad = dayjs('2023-05-27').add('12', 'hour');
    const arrivalDate = dayjs('2019-07-01');
    const totalDays = grad.diff(arrivalDate, 'days');
    const finalDiff = grad.diff(now);
    const days = Math.floor(finalDiff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((finalDiff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((finalDiff % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((finalDiff % (60 * 1000)) / 1000);
    const formattedDiff = `**${days} days**, **${hours} hours**, **${minutes} minutes**, and **${seconds} seconds**`;
    const daysSinceArrival = now.diff(arrivalDate, 'days');
    const sentencePercentage = ((daysSinceArrival/totalDays)*100).toFixed(2);
    
    toSend += "🥳 The Class of 2023 has served **" + sentencePercentage + "%** of our total time.";
    toSend += "\n";
    toSend += "🅿️ **" + daysSinceArrival + "** days have passed since our arrival on 01 Jul 2019.";
    toSend += "\n";
    toSend += `⏳ There are ${formattedDiff} left until graduation on 27 May 2023.`;
    return toSend;
}

const graduation = dayjs('2023-05-27');

function dailyMessage(){
    const now = dayjs().format('DD MMM YYYY');
    if (graduation.isSame(now,'day')){
        console.log("Graduation day!");
        const calculated = calculateDays();
        client.channels.fetch(channelID).then((channel) => {
            var toSend = "@everyone";
            toSend += "\n\n";
            toSend += `🎓 Congratulations Class of 2023! Today is ${now}.\n`;
            toSend += "🥳 We made it! Today, we are officially graduating from the United States Military Academy.\n\n";
            toSend += "It has been an honor serving you all, updating you on your time left here.\n";
            toSend += "No matter where we go or what we do after graduation, please remember that you are loved and that you have friends.\n\n";
            toSend += "This is my final countdown message to you all as a class.\n\n";
            channel.send(toSend + calculated);
        }); 
    }
    else if (graduation.isAfter(now,'day')){
        const calculated = calculateDays();
        client.channels.fetch(channelID).then((channel) => {
            var toSend = "@everyone\n\n";
            toSend += `☀️ Good morning code slingers! Today is ${now}.\n`;
            channel.send(toSend + calculated);
        }); 
    }
    else {
        console.log("Graduation has passed");
    }
}

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
    cron.schedule('0 12 * * *', () => {
        dailyMessage();
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