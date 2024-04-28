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
	async execute(interaction) {
		const channel = interaction.options.getChannel('channel');
		let messages = [];
		
		await interaction.reply('Getting all messages inside channel "' + channel.name + '".....');

		try {
			// Create message pointer
			// Gets the first message so it will know where to get the other messages
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
			while (message) { // Loops through all the messages inside the channel
				await channel.messages
					.fetch({ limit: 100, before: message.id }) // Discord limits how many messages you can get at one time
					.then(messagePage => {
						messagePage.forEach(msg => messages.push(msg)); // Adds it to the collection

						// Update our message pointer to be the last message on the page of messages
						message = 0 < messagePage.size ? messagePage.at(messagePage.size - 1) : null;
					});
				count++; // Increments counter
				if (count % 10 == 0) {
					await interaction.editReply('Getting all messages inside channel "' + channel.name + '"..... (' + (count * 100) + ' messages counted)');
				}
			}

			// Handles error if there is not any messages retrieved
			// could be bot can't see any messages due to lack of view channel history permission
			if (messages.length == 0) {
				await interaction.editReply("Failed! Couldn't get messages for some odd reason.");
				return null;
			}

			//await interaction.editReply('Successfully got all messages. Formatting and converting into JSON.....');
			await interaction.editReply('Successfully got all messages. Formatting and converting into file.....');

			// Collects all useful data and puts it into another collection starting from the end to sort it by time
			let formattedmessages = [];
			for (let i = messages.length - 1; i >= 0; i--) {
				let msg = {
					"messageId" : messages[i].id,
					"username" : (messages[i].member && messages[i].member.nickname) || messages[i].author.displayName, // use nickname if it exists or displayName
					"userId" : messages[i].author.id,
					"isBot" : messages[i].author.bot,
					"content" : messages[i].content,
					"createdTimestamp" : messages[i].createdTimestamp
				}

				// Detects if there's some kind of attachment
				// Adds it to the message so others can manually insert it in
				// TODO: figure out a way to do this for them
				if (messages[i].attachments.size != 0) {
					msg["content"] = msg["content"] + " ATTACHMENT: https://discord.com/channels/" + channel.guild.id + "/" + channel.id + "/" + msg["messageId"];
				}

				// Adds message to the collection
				formattedmessages.push(msg);
			}

			// Gets the file paths to add files
			let guildsDirPath = path.join(__dirname, "../../files/guilds", interaction.guildId);
			let txtFilePath = path.join(guildsDirPath, channel.id + ".txt");

			// Makes folder for the specific server/guild
			await fs.promises.mkdir(guildsDirPath, { recursive : true});
			
			// Opens the file to avoid repeatedly reopening the same file
			let file = await fs.promises.open(txtFilePath, "w+");
			
			// Clears the file first or makes the file if it doesn't exist
			file.writeFile("");

			// Appends to the file for each message
			let lastMessageOwner = null;
			for (let i = 0; i < formattedmessages.length; i++) {
				if (lastMessageOwner == formattedmessages[i].userId) {
					await file.appendFile("\t" + formattedmessages[i].content + "\r\n");
				} else {
					lastMessageOwner = formattedmessages[i].userId;
					await file.appendFile(formattedmessages[i].username + ":\r\n\t" + formattedmessages[i].content + "\r\n");
				}
			}

			// Closes the file
			await file.close();

			await interaction.editReply({content:"Successfully got messages and saved into file.", files: [txtFilePath]})

			// // Convert object notation to JSON
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
		} catch (error) { // Handles if commands errors
			// TODO: Rewrite to do this for every command (though think about error reasoning such as lack of permission, etc)
			success = false;
			console.log("Command fetchAllMessages errored! Error reason: " + error.stack);
			await interaction.editReply("Error occurred! Failed to fetch messages... Error reason: " + error);
		}
	},
};