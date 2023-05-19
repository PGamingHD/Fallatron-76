import {
    ActionRowBuilder,
    AnyComponentBuilder,
    APIEmbed,
    ApplicationCommandType,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    CacheType,
    Collection,
    ComponentType,
    EmbedBuilder,
    Guild,
    GuildBasedChannel,
    GuildMember,
    GuildTextBasedChannel,
    InteractionCollector,
    InteractionResponse,
    Message,
    ModalBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    StringSelectMenuOptionBuilder,
    TextInputBuilder,
    TextInputStyle
} from 'discord.js';
import { ContextMenu } from '../../structures/ContextMenu';
import db from "../../utils/database";
import {Order, user} from "@prisma/client";
import {Colours} from "../../@types/Colours";

export default new ContextMenu({
    name: 'Find user information',
    type: ApplicationCommandType.Message,
    run: async ({ interaction, client }) => {
        if (!interaction.guild ) return;
        const user: any = await db.findLoggedIn(interaction.user.id as string);
        if (!user) return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('You do not seem to be logged in, please login before using this command.')]});

        const {useraccount} = user;

        if (useraccount.type !== "OWNER") return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('You do not have access to this command, you require the permission \`OWNER\` to execute this command.')]});

        if (!interaction.channel) return;
        const msg: Message | null = await interaction.channel.messages.fetch(interaction.targetId);

        const userInfo: user | null = await db.findUserId(msg.author.id);

        if (!userInfo) return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('The user selected does not yet have an account registered.')]});

        return interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setColor(Colours.GREEN)
                    .setTitle(`🤖 User Information - ${msg.author.tag}🤖`)
                    .setDescription(`\`\`\`Username: ${userInfo.username}\nPassword (Hashed): ${userInfo.password}\n\nUser ID: ${userInfo.id}\nLogged in: ${userInfo.loggedin == true ? 'True' : 'False'}\`\`\``)
                    .setTimestamp()
            ]
        });
    },
});