const { SlashCommandBuilder } = require('discord.js');
const dayjs = require('dayjs')


module.exports = {
	data: new SlashCommandBuilder()
		.setName('despair')
		.setDescription('Shows the countdown until graduation.'),
	async execute(interaction) {
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
        await interaction.reply(toSend);
	},
};