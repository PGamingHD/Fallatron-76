import {
    ApplicationCommandOptionType,
    ChannelType,
    EmbedBuilder,
    Guild,
    GuildMember,
} from 'discord.js';
import { Modal } from '../../structures/Modal';
import {Order, user} from "@prisma/client";
import {Colours} from "../../@types/Colours";
import db from "../../utils/database";
import { v4 as uuidv4 } from 'uuid';

export default new Modal({
    customId: 'orderModal',
    run: async ({interaction, client, args}) => {
        const username: string = args.getTextInputValue('orderUser');
        const password: string = args.getTextInputValue('orderPass');
        const uid: string = args.getTextInputValue('orderId');
        const todo: string = args.getTextInputValue('orderTodo');

        const latest: Order[] = await db.findLatestOrder(uid);

        let target;
        const guild: Guild = await client.guilds.fetch(process.env.MAIN_GUILD as string);
        try {
            const test: GuildMember = await guild.members.fetch(uid);

            if (test) target = test;
        } catch {}

        if (!target) return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('You have provided an invalid Discord User ID, please make sure it is valid!')]})

        const findAcc: user | null = await db.findUserId(uid);

        if (!findAcc) return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('That user does not seem to have an account, please have them register first!')]})

        let nextId: number = 1;
        if (latest.length !== 0) {
            nextId = latest[0].orderId + 1;
        }

        await db.registerNewOrder(uuidv4(), uid, username, password, nextId, todo);

        return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.GREEN).setDescription('You have successfully inserted the order data into the database.')]});
    },
});

