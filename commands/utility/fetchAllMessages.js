const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('fetchallmessages')
		.setDescription('Gets all the messages within a channel')
		.addChannelOption(option =>
			option.setName('channel')
				.setDescription('The channel to fetch from')
				.setRequired(true)
				.addChannelTypes(ChannelType.GuildText))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
	async execute(interaction) { // TODO: test for different symbols in text like S̵͑̃a̵̓̕ď̴̆i̷͛̋e̸͌͂.
		if (interaction.user.id == "200021544993292291" || interaction.user.id == "407689241112346635") { // Me and Koro's discord id
			const channel = interaction.options.getChannel('channel');
			// console.log(interaction.guild);
			let messages = [];

			let isError = false;
			// Create message pointer
			let message = await channel.messages
				.fetch({ limit: 1})
				.then(messagePage => (messagePage.size === 1 ? messagePage.at(0) : null))
				.catch(error => {
					isError = true;
					console.log("Failed to get messages. Error: " + error);
					return null;
				});

			while (message) {
				await channel.messages
					.fetch({ limit: 100, before: message.id })
					.then(messagePage => {
						messagePage.forEach(msg => messages.push(msg));

						// Update our message pointer to be the last message on the page of messages
						message = 0 < messagePage.size ? messagePage.at(messagePage.size - 1) : null;
					})
					.catch(error => {
						isError = true;
						console.log("Failed to get more messages. Error: " + error);
						return null;
					});
			}

			console.log(messages)

			if (isError) {
			await interaction.reply('Error! Does the bot have the correct permissions?');
			} else {
				await interaction.reply('Successfully got messages.');
			}
		} else {
			await interaction.reply('User does not have correct permissions!');
		}
	},
};