import {
    ActionRowBuilder,
    AnyComponentBuilder,
    APIEmbed,
    ApplicationCommandOptionType,
    ChannelType,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} from 'discord.js';
import { Command } from '../../structures/Command';

export default new Command({
    name: 'login',
    description: 'Login to an existing services account',
    modalCommand: true,
    run: async ({ interaction, client }) => {
        const modal: ModalBuilder = new ModalBuilder().setCustomId('loginModal').setTitle('Login to Account');

        const haveComponent: TextInputBuilder = new TextInputBuilder().setCustomId('loginUser').setLabel('Enter your username').setStyle(TextInputStyle.Short).setMaxLength(32).setMinLength(5).setRequired(true);
        const wantComponent: TextInputBuilder = new TextInputBuilder().setCustomId('loginPass').setLabel('Enter your password').setStyle(TextInputStyle.Short).setMaxLength(32).setMinLength(5).setRequired(true);

        const firstActionRow: ActionRowBuilder<AnyComponentBuilder> = new ActionRowBuilder().addComponents(haveComponent);
        const secondActionRow: ActionRowBuilder<AnyComponentBuilder> = new ActionRowBuilder().addComponents(wantComponent);

        //@ts-ignore
        modal.addComponents(firstActionRow, secondActionRow);

        return interaction.showModal(modal);
    },
});