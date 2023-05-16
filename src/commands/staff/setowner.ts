import {
    APIEmbed,
    ApplicationCommandOptionType,
    ChannelType,
    EmbedBuilder,
    TextInputStyle
} from 'discord.js';
import { Command } from '../../structures/Command';
import {Colours} from "../../@types/Colours";
import db from "../../utils/database";
import {user} from "@prisma/client";

export default new Command({
    name: 'setowner',
    description: 'Add owner permissions to a registered user',
    modalCommand: true,
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: 'username',
            description: 'Registered username',
            required: true,
        },
    ],
    run: async ({ interaction, client }) => {
        if (!interaction.guild) return;

        if (interaction.user.id !== interaction.guild.ownerId) return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('You do not have access to this command, you require the permission \`SERVER OWNER\` to execute this command.')]})
        const username: string | null = interaction.options.getString('username');

        if (!username) return;

        const user: user | null = await db.findUsername(username.toLowerCase());

        if (!user) return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('The username inserted does not exist, is it a valid account?')]});

        await db.updateUserType(user.id, "OWNER");

        return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.GREEN).setDescription('You successfully set the user to \`OWNER\` permissions.')]})
    },
});