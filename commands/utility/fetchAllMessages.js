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

			try {
				// Create message pointer
				let message = await channel.messages
					.fetch({limit: 1})
					.then(messagePage => {
						let msg = messagePage.at(0);

						if (messagePage.size === 1) {
							messages.push(msg);
							return msg;
						} else {
							return null;
						}
					});

				let count = 0;
				while (message) {
					await channel.messages
						.fetch({ limit: 100, before: message.id })
						.then(messagePage => {
							messagePage.forEach(msg => messages.push(msg));

							// Update our message pointer to be the last message on the page of messages
							message = 0 < messagePage.size ? messagePage.at(messagePage.size - 1) : null;
						});
					count++;
					if (count % 10 == 0) {
						await interaction.editReply('Getting all messages inside channel "' + channel.name + '"..... (' + (count * 100) + ' messages counted)');
					}
				}

				if (messages.length == 0) {
					await interaction.editReply("Failed! Couldn't get messages for some odd reason.");
					return null;
				}

				//await interaction.editReply('Successfully got all messages. Formatting and converting into JSON.....');
				await interaction.editReply('Successfully got all messages. Formatting and converting into file.....');

				let formattedmessages = [];
				for (let i = messages.length - 1; i >= 0; i--) {
					let msg = {
						"messageId" : messages[i].id,
						"username" : (messages[i].member && messages[i].member.nickname) || messages[i].author.displayName,
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

				// console.log(messages[i].member.nickname);

				let guildsDirPath = path.join(__dirname, "../../files/guilds", interaction.guildId);
				let txtFilePath = path.join(guildsDirPath, channel.id + ".txt");

				await fs.promises.mkdir(guildsDirPath, { recursive : true});
				
				let file = await fs.promises.open(txtFilePath, "w+");
				
				file.writeFile(""); // clear file first if there is any

				let lastMessageOwner = null;
				for (let i = 0; i < formattedmessages.length; i++) {
					if (lastMessageOwner == formattedmessages[i].userId) {
						await file.appendFile("\t" + formattedmessages[i].content + "\r\n");
					} else {
						lastMessageOwner = formattedmessages[i].userId;
						await file.appendFile(formattedmessages[i].username + ":\r\n\t" + formattedmessages[i].content + "\r\n");
					}
				}

				await file.close();

				await interaction.editReply({content:"Successfully got messages and saved into file.", files: [txtFilePath]})

				// let jsonText = JSON.stringify({
				// 	"guildId" : channel.guild.id,
				// 	"channelId" : channel.id,
				// 	"messages" : formattedmessages
				// });

				// let guildsDirPath = path.join(__dirname, "../../files/guilds", interaction.guildId);
				// let txtFilePath = path.join(guildsDirPath, channel.id + ".json");

				// await fs.promises.mkdir(guildsDirPath, { recursive : true});

				// await interaction.editReply('Successfully converted into JSON. Saving into file.....')
				
				// await fs.promises.writeFile(txtFilePath, jsonText)
				// 	.then(() => {
				// 		console.log("Saved guild channel messages into path " + txtFilePath + " from channel " + channel.name + " from server " + interaction.member.guild.name);
				// 	});
			} catch (error) {
				success = false;
				console.log("Command fetchAllMessages errored! Error reason: " + error.stack);
				await interaction.editReply("Error occurred! Failed to fetch messages... Error reason: " + error);
			}
		} else {
			await interaction.reply('User does not have correct permissions!');
		}
	},
};