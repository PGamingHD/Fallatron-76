import {
    ApplicationCommandOptionType,
    ChannelType,
    EmbedBuilder,
} from 'discord.js';
import { Modal } from '../../structures/Modal';
import {user} from "@prisma/client";
import {Colours} from "../../@types/Colours";
import db from "../../utils/database";
import * as argon2 from 'argon2';

export default new Modal({
    customId: 'loginModal',
    run: async ({interaction, client, args}) => {
        const username: string = args.getTextInputValue('loginUser');
        const password: string = args.getTextInputValue('loginPass');

        const exists: user | null = await db.validateUsername(username.toLowerCase());

        if (!exists) return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('The entered username does not seem to exist, did you make a typo?')]});

        const confirmHash: boolean = await argon2.verify(exists.password, password);

        if (!confirmHash) return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('The entered password does not seem to be correct, did you make a typo?')]});

        const loggedIn: user | null = await db.findLoggedIn(interaction.user.id);

        if (loggedIn) return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('You are currently logged into an account, please use /logout first!')]});

        await db.accountLogin(interaction.user.id, exists.username);

        return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.GREEN).setDescription('You are successfully logged in, welcome back ' + exists.username + '!')]});
    },
});

