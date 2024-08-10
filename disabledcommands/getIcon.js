const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('geticon')
		.setDescription('Provides information about the server icon.'),
	async execute(interaction) {
		// interaction.guild is the object representing the Guild in which the command was run
        await interaction.reply(`This server's icon url is ${interaction.guild.iconURL()}.`)
	},
};