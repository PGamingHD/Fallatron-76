import {
    ChatInputApplicationCommandData,
    ChatInputCommandInteraction,
    CommandInteractionOptionResolver,
    MessageApplicationCommandData,
    MessageContextMenuCommandInteraction,
    PermissionResolvable,
    UserApplicationCommandData,
    UserContextMenuCommandInteraction,
    ModalSubmitInteraction,
    ModalSubmitInteractionCollectorOptions, ModalSubmitFields,
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

interface ModalOptions {
    client: ExtendedClient;
    interaction: ModalSubmitInteraction;
    args: ModalSubmitFields;
}

type RunFunction = (options: RunOptions) => any;
type MenuFunction = (options: MenuOptions) => any;
type ModalFunction = (options: ModalOptions) => any;

export type CommandType = {
    ownerCommand?: boolean;
    managerCommand?: boolean;
    modalCommand?: boolean;
    userPermissions?: PermissionResolvable[];
    main?: boolean;
    run: RunFunction;
} & ChatInputApplicationCommandData;

export type MenuType = {
    userPermissions?: PermissionResolvable[];
    main?: boolean;
    run: MenuFunction;
} & (MessageApplicationCommandData | UserApplicationCommandData);

export type ModalType = {
    customId: string;
    run: ModalFunction;
} & (ModalSubmitInteractionCollectorOptions<any>);