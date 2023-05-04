import { ApplicationCommandOptionType, ChannelType } from 'discord.js';
import { Command } from '../../structures/Command';
import { sendSuccess } from "../../utils/messages";

export default new Command({
    name: 'test',
    description: 'This is just a testing command, desc here!',
    defaultMemberPermissions: 'Administrator',
    run: async ({ interaction, client }) => {
        await sendSuccess(interaction, 'Logged to console!', true);
        return console.log('This is what is sent when the command is triggered!');
    },
});