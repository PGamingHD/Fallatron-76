import {
    APIEmbed,
    ApplicationCommandOptionType,
    ButtonStyle,
    ChannelType,
    ComponentType,
    EmbedBuilder,
    TextInputStyle
} from 'discord.js';
import { Command } from '../../structures/Command';
import {Colours} from "../../@types/Colours";
import db from "../../utils/database";
import * as argon2 from 'argon2';

export default new Command({
    name: 'changepass',
    description: 'Change the password of an existing account',
    noDefer: true,
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: 'username',
            description: 'Registered username',
            required: true,
        },
        {
            type: ApplicationCommandOptionType.String,
            name: 'newpass',
            description: 'The new account password',
            required: true
        }
    ],
    run: async ({ interaction, client }) => {
        if (!interaction.guild) return;
        const user: any = await db.findLoggedIn(interaction.user.id as string);
        if (!user) return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('You do not seem to be logged in, please login before using this command.')]});

        const username: string | null = interaction.options.getString('username');
        const newpass: string | null = interaction.options.getString('newpass');

        if (!username) return;
        if (!newpass) return;

        const {useraccount} = user;

        if (useraccount.type !== "OWNER") return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('You do not have access to this command, you require the permission \`OWNER\` to execute this command.')]})

        const target: any = await db.findUsername(username);

        if (!target) return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('The user was not found, did you make a typo?')]});

        let mediumPassword: RegExp = new RegExp('((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{6,}))|((?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9])(?=.{8,}))');
        let strongPassword: RegExp = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})');

        let passwordType: string = "weak";
        if (strongPassword.test(newpass)) {
            passwordType = 'strong';
        } else if (mediumPassword.test(newpass)) {
            passwordType = 'medium';
        }

        if (passwordType === 'weak') return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('The password is too weak, please enter atleast 6 characters, atleast 1 uppercase letter & atleast 1 digit & a special character.')]})

        const hashed: string = await argon2.hash(newpass, {type: argon2.argon2id, memoryCost: 1024, timeCost: 1000});

        await db.updateUserPassword(target.id, hashed);

        return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.GREEN).setDescription(`The account username \`${target.username}\` has been updated with the new password and can login again.`)]});
    },
});