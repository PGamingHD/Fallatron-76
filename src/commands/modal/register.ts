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
    name: 'register',
    description: 'Register an account to use on our services',
    noDefer: true,
    run: async ({ interaction, client }) => {
        const modal: ModalBuilder = new ModalBuilder().setCustomId('registerModal').setTitle('Register Account');

        const haveComponent: TextInputBuilder = new TextInputBuilder().setCustomId('userText').setLabel('Enter a username').setStyle(TextInputStyle.Short).setMaxLength(32).setMinLength(4).setRequired(true);
        const wantComponent: TextInputBuilder = new TextInputBuilder().setCustomId('passText').setLabel('Enter a password').setStyle(TextInputStyle.Short).setMaxLength(32).setMinLength(6).setRequired(true);

        const firstActionRow: ActionRowBuilder<AnyComponentBuilder> = new ActionRowBuilder().addComponents(haveComponent);
        const secondActionRow: ActionRowBuilder<AnyComponentBuilder> = new ActionRowBuilder().addComponents(wantComponent);

        //@ts-ignore
        modal.addComponents(firstActionRow, secondActionRow);

        return interaction.showModal(modal);
    },
});