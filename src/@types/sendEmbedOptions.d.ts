import {
    ActionRowComponent,
    ActionRowComponentOptions,
    APIEmbed,
    CommandInteraction,
    TextBasedChannel,
    User,
} from 'discord.js';

export interface sendEmbedOptions {
    interaction?: CommandInteraction;
    channel?: TextBasedChannel | User;
    content?: string;
    embed: APIEmbed;
    ephemeral?: boolean;
    components?: (ActionRowComponent | ActionRowComponentOptions)[] | undefined;
}