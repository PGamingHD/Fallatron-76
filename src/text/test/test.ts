import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    ChannelType,
} from 'discord.js';
import { Text } from '../../structures/Text';

export default new Text({
    name: 'hey',
    type: ApplicationCommandType.Message,
    hidden: true,
    run: async ({message, client, args}) => {
        await message.reply(`Yo ${args[0] === undefined ? 'no args' : args.length <= 1 ? args[0] : args.join(' ')}`);
    },
});

