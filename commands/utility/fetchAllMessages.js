const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

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
			let messages = [];
			
			await interaction.reply('Getting all messages inside channel "' + channel.name + '".....');

			let success = true;
			try {
				// Create message pointer
				let message = await channel.messages
					.fetch({ limit: 1})
					.then(messagePage => {
						let msg = messagePage.at(0);
						messages.push(msg);
						return messagePage.size === 1 ? msg : null;
					});

				while (message) {
					await channel.messages
						.fetch({ limit: 100, before: message.id })
						.then(messagePage => {
							messagePage.forEach(msg => messages.push(msg));

							// Update our message pointer to be the last message on the page of messages
							message = 0 < messagePage.size ? messagePage.at(messagePage.size - 1) : null;
						});
				}

				await interaction.editReply('Successfully got all messages. Formatting and converting into JSON.....');

				let formattedmessages = [];
				for (let i = messages.length - 1; i >= 0; i--) {
					let msg = {
						"messageId" : messages[i].id,
						"username" : messages[i].author.username,
						"userId" : messages[i].author.id,
						"isBot" : messages[i].author.bot,
						"content" : messages[i].content,
						"createdTimestamp" : messages[i].createdTimestamp
					}
					
					if (messages[i].attachments.size != 0) {
						msg["content"] = msg["content"] + " ATTACHMENT: https://discord.com/channels/" + channel.guild.id + "/" + channel.id + "/" + msg["messageId"];
					}

					formattedmessages.push(msg);
				}

				let jsonText = JSON.stringify({
					"guildId" : channel.guild.id,
					"channelId" : channel.id,
					"messages" : formattedmessages
				});

				let guildsDirPath = path.join(__dirname, "../../files/guilds", interaction.guildId);
				let txtFilePath = path.join(guildsDirPath, channel.id + ".json");

				await fs.promises.mkdir(guildsDirPath, { recursive : true});

				await interaction.editReply('Successfully converted into JSON. Saving into file.....')
				
				await fs.promises.writeFile(txtFilePath, jsonText)
					.then(() => {
						console.log("Saved guild channel messages into path " + txtFilePath + " from channel " + channel.name + " from server " + interaction.member.guild.name);
					});
			
			} catch (error) {
				success = false;
				console.log("Command fetchAllMessages errored! Error reason: " + error.stack);
				await interaction.editReply("Error occurred! Failed to fetch messages... Error reason: " + error);
			}

			if (success) {
				await interaction.editReply('Successfully got messages and saved into file.');
			}
		} else {
			await interaction.reply('User does not have correct permissions!');
		}
	},
};