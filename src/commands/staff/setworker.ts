import {
    APIEmbed,
    ApplicationCommandOptionType,
    ChannelType,
    EmbedBuilder,
    TextInputStyle
} from 'discord.js';
import { Command } from '../../structures/Command';
import {Colours} from "../../@types/Colours";
import {user} from "@prisma/client";
import db from "../../utils/database";

export default new Command({
    name: 'setworker',
    description: 'Add worker permissions to a registered user',
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

        const username: string | null = interaction.options.getString('username');

        if (!username) return;

        const user: any = await db.findLoggedIn(interaction.user.id as string);

        if (!user) return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('You do not seem to be logged in, please login before using this command.')]});

        const target: any = await db.findUsername(username.toLowerCase());

        if (!target) return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('The username inserted does not exist, is it a valid account?')]});

        if (user.useraccount.type !== "MANAGER" && user.useraccount.type !== "OWNER") return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('You do not have access to this command, you require the permission \`MANAGER+\` to execute this command.')]})

        await db.updateUserType(target.id, "WORKER");

        return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.GREEN).setDescription('You successfully set the user to \`WORKER\` permissions.')]});
    },
});