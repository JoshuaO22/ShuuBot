const { SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('returns something that is being tested')
        .addChannelOption(option =>
			option.setName('channel')
				.setDescription('The channel to test'))
        .addRoleOption(option =>
			option.setName('role')
				.setDescription('The role to test'))
        .addUserOption(option =>
			option.setName('user')
				.setDescription('The user to test'))
        .addNumberOption(option =>
			option.setName('number')
				.setDescription('The number to test'))
        .addStringOption(option =>
			option.setName('string')
				.setDescription('The string to test'))
        .addBooleanOption(option =>
			option.setName('boolean')
				.setDescription('The boolean to test'))
        .addIntegerOption(option =>
			option.setName('integer')
				.setDescription('The integer to test'))
        .addAttachmentOption(option =>
			option.setName('attachment')
				.setDescription('The attachment to test'))
        .addMentionableOption(option =>
			option.setName('mentionable')
				.setDescription('The mentionable to test')),
	async execute(interaction) {
        if (interaction.user.id == "200021544993292291") { // only me
            const channel = interaction.options.getChannel("channel");
            const role = interaction.options.getRole("role");
            const user = interaction.options.getUser("user");
            const number = interaction.options.getNumber("number");
            const string = interaction.options.getString("string");
            const boolean = interaction.options.getBoolean("boolean");
            const integer = interaction.options.getInteger("integer");
            const attachment = interaction.options.getAttachment("attachment");
            const mentionable = interaction.options.getMentionable("mentionable");

            if (channel) {
                console.log(channel);
            }
            if (role) {
                console.log(role);
            }
            if (user) {
                console.log(user);
            }
            if (number) {
                console.log(number);
            }
            if (string) {
                console.log(string);
            }
            if (boolean) {
                console.log(boolean);
            }
            if (integer) {
                console.log(integer);
            }
            if (attachment) {
                console.log(attachment);
            }
            if (mentionable) {
                console.log(mentionable);
            }

            console.log(interaction);

            // console.log(__filename);
            // console.log(path.join(__dirname, "../../files/guilds", interaction.guildId));

            await interaction.reply("Welcome supreme overlord.")
        } else {
            await interaction.reply("You are forbidden to use this command, peasant.")
        }
	},
};