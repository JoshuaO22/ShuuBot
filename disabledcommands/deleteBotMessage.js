const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('deletebotmessage')
		.setDescription('Provides information about the server icon.')
        .addStringOption(option =>
			option.setName('channelid')
				.setDescription('The channel to fetch from')
				.setRequired(true))
        .addStringOption(option =>
                option.setName('messageid')
                    .setDescription('The specific message to delete')
                    .setRequired(true)),
	async execute(interaction) {
        const channelid = interaction.options.getString('channelid');
        const messageid = interaction.options.getString('messageid');

        await interaction.client.channels.cache.get(channelid).messages.fetch(messageid).then(message => message.delete());
        await interaction.reply(`Successfully deleted message.`)
	},
};