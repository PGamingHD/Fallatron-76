import {
    CommandInteractionOptionResolver,
    ModalSubmitFields,
    Events,
    EmbedBuilder
} from 'discord.js';
import { client } from '../bot';
import { Event } from '../structures/Event';
import logger from '../utils/logger';
import {Colours} from "../@types/Colours";
import {CommandType, MenuType, ModalType} from "../@types/Command";


export default new Event(Events.InteractionCreate, async interaction => {
    // Chat Input Commands
    if (interaction.isChatInputCommand()) {
        const command: CommandType | undefined = client.commands.get(interaction.commandName);
        if (!command) return interaction.followUp('You have used a non existent command');

        let bla: string;
        if (command.noDefer) bla = 'hey';

        else await interaction.deferReply();

        try {
            await command.run({
                args: interaction.options as CommandInteractionOptionResolver,
                client,
                interaction: interaction,
            });
        } catch (e) {
            logger.error(e);
        }
    }

    // Context Menu Commands
    else if (interaction.isMessageContextMenuCommand() || interaction.isUserContextMenuCommand()) {
        const command: MenuType | undefined = client.contextmenus.get(interaction.commandName);
        if (!command) return interaction.followUp('You have used a non existent context menu');
        try {
            await command.run({
                args: interaction.options as CommandInteractionOptionResolver,
                client,
                interaction,
            });
        } catch (e) {
            logger.error(e);
        }
    }

    else if (interaction.isModalSubmit()) {
        const modal: ModalType | undefined = client.modals.get(interaction.customId);
        if (!modal) return interaction.followUp('You have used a non existing modal command, please report this!');
        try {
            await modal.run({args: interaction.fields as ModalSubmitFields, client, interaction});
        } catch (e) {
            logger.error(e)
        }
    }
    return;
});