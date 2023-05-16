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
    name: 'logout',
    description: 'Logout from your account',
    modalCommand: true,
    run: async ({ interaction, client }) => {
        const loggedIn: user | null = await db.findLoggedIn(interaction.user.id);

        if (!loggedIn) return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('You do not seem to be logged in, please login before using this command.')]});

        await db.accountLogout(loggedIn.username);

        return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.GREEN).setDescription('You successfully logged out of your existing account.')]})
    },
});