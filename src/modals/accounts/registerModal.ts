import {
    ApplicationCommandOptionType,
    ChannelType,
    EmbedBuilder,
} from 'discord.js';
import { Modal } from '../../structures/Modal';
import {user} from "@prisma/client";
import {Colours} from "../../@types/Colours";
import db from "../../utils/database";
import { v4 as uuidv4 } from 'uuid';
import * as argon2 from 'argon2';

export default new Modal({
    customId: 'registerModal',
    run: async ({interaction, client, args}) => {
        if (!interaction.guild) return;

        const hasAccount: user | null = await db.findUserId(interaction.user.id);

        if (hasAccount) return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('You already seem to have an registered account, forgot password / username? Please ask the staff for support!')]})

        const username: string = args.getTextInputValue('userText');
        const password: string = args.getTextInputValue('passText');

        let mediumPassword: RegExp = new RegExp('((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{6,}))|((?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9])(?=.{8,}))');
        let strongPassword: RegExp = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})');

        let passwordType: string = "weak";
        if (strongPassword.test(password)) {
            passwordType = 'strong';
        } else if (mediumPassword.test(password)) {
            passwordType = 'medium';
        }

        const usernameExists: user | null = await db.validateUsername(username.toLowerCase());

        if (usernameExists) return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('The chosen username has already been taken, please choose another one!')]})

        if (passwordType === 'weak') return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('Your password is too weak, please enter atleast 6 characters, atleast 1 uppercase letter & atleast 1 digit & a special character.')]})

        const hashed: string = await argon2.hash(password, {type: argon2.argon2id, memoryCost: 1024, timeCost: 1000});

        const id: string = uuidv4();
        await db.registerNewUser({id, userid: interaction.user.id, username: username.toLowerCase(), password: hashed});
        await db.registerNewUAccount({id});

        return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.GREEN).setDescription('Your account has been registered, please use /login to login to your new account!')]});
    },
});

