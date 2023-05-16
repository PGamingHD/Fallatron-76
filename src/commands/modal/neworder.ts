import {
    ActionRowBuilder,
    AnyComponentBuilder,
    APIEmbed,
    ApplicationCommandOptionType,
    ChannelType,
    EmbedBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} from 'discord.js';
import { Command } from '../../structures/Command';
import db from "../../utils/database";
import {Colours} from "../../@types/Colours";

export default new Command({
    name: 'neworder',
    description: 'Add a new order to someone',
    modalCommand: true,
    run: async ({ interaction, client }) => {
        const user: any = await db.findLoggedIn(interaction.user.id as string);

        if (!user) return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('You do not seem to be logged in, please login before using this command.')]});

        const {useraccount} = user;

        if (useraccount.type !== "OWNER") return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('You do not have access to this command, you require the permission \`OWNER\` to execute this command.')]})

        const modal: ModalBuilder = new ModalBuilder().setCustomId('orderModal').setTitle('Add a new order with account');

        const haveComponent: TextInputBuilder = new TextInputBuilder().setCustomId('orderUser').setLabel('Enter your account username').setStyle(TextInputStyle.Short).setMaxLength(50).setMinLength(2).setRequired(true);
        const wantComponent: TextInputBuilder = new TextInputBuilder().setCustomId('orderPass').setLabel('Enter your account password').setStyle(TextInputStyle.Short).setMaxLength(50).setMinLength(2).setRequired(true);
        const todoComponent: TextInputBuilder = new TextInputBuilder().setCustomId('orderTodo').setLabel('Enter what the customers want with the order').setStyle(TextInputStyle.Paragraph).setMaxLength(250).setMinLength(10).setRequired(true);
        const userComponent: TextInputBuilder = new TextInputBuilder().setCustomId('orderId').setLabel('Enter order owners discord UID').setStyle(TextInputStyle.Short).setMaxLength(25).setMinLength(15).setRequired(true);

        const firstActionRow: ActionRowBuilder<AnyComponentBuilder> = new ActionRowBuilder().addComponents(haveComponent);
        const secondActionRow: ActionRowBuilder<AnyComponentBuilder> = new ActionRowBuilder().addComponents(wantComponent);
        const thirdActionRow: ActionRowBuilder<AnyComponentBuilder> = new ActionRowBuilder().addComponents(userComponent);
        const fourthActionRow: ActionRowBuilder<AnyComponentBuilder> = new ActionRowBuilder().addComponents(todoComponent);

        //@ts-ignore
        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow);

        return interaction.showModal(modal);
    },
});