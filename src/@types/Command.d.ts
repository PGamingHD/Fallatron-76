import {
    ChatInputApplicationCommandData,
    ChatInputCommandInteraction,
    CommandInteractionOptionResolver,
    MessageApplicationCommandData,
    MessageContextMenuCommandInteraction,
    PermissionResolvable,
    UserApplicationCommandData,
    UserContextMenuCommandInteraction,
} from 'discord.js';
import { ExtendedClient } from '../structures/Client';

interface RunOptions {
    client: ExtendedClient;
    interaction: ChatInputCommandInteraction;
    args: CommandInteractionOptionResolver;
}

interface MenuOptions {
    client: ExtendedClient;
    interaction: MessageContextMenuCommandInteraction | UserContextMenuCommandInteraction;
    args: CommandInteractionOptionResolver;
}

type RunFunction = (options: RunOptions) => any;
type MenuFunction = (options: MenuOptions) => any;

export type CommandType = {
    userPermissions?: PermissionResolvable[];
    main?: boolean;
    run: RunFunction;
} & ChatInputApplicationCommandData;

export type MenuType = {
    userPermissions?: PermissionResolvable[];
    main?: boolean;
    run: MenuFunction;
} & (MessageApplicationCommandData | UserApplicationCommandData);