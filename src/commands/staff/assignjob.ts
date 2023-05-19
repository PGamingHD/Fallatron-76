import {
    ActionRowBuilder,
    AnyComponentBuilder,
    APIEmbed,
    ApplicationCommandOptionType,
    ButtonStyle, CacheType,
    ChannelType,
    ComponentType,
    EmbedBuilder,
    Guild,
    GuildBasedChannel,
    GuildMember,
    GuildTextBasedChannel,
    InteractionCollector,
    InteractionResponse,
    Message, ModalBuilder,
    StringSelectMenuBuilder, StringSelectMenuInteraction,
    StringSelectMenuOptionBuilder, TextInputBuilder,
    TextInputStyle
} from 'discord.js';
import { Command } from '../../structures/Command';
import {Colours} from "../../@types/Colours";
import {Order} from "@prisma/client";
import db from "../../utils/database";

export default new Command({
    name: 'assignjob',
    description: 'Assign a job to a specific worker, manager or owner',
    modalCommand: true,
    run: async ({ interaction, client }) => {
        if (!interaction.guild) return;
        const user: any = await db.findLoggedIn(interaction.user.id as string);
        if (!user) return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('You do not seem to be logged in, please login before using this command.')]});

        const {useraccount} = user;

        if (useraccount.type !== "OWNER") return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('You do not have access to this command, you require the permission \`OWNER\` to execute this command.')]})

        const AllOrders: Order[] = await db.GetAllOrders();

        if (AllOrders.length === 0) return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('There are no jobs available to assign at the moment.')]})

        let options: any[] = [];
        for (let order of AllOrders) {
            let target = null;

            const guild: Guild = await client.guilds.fetch(process.env.MAIN_GUILD as string);
            try {
                const test: GuildMember = await guild.members.fetch(order.userid);

                if (test) target = test;
            } catch {}

            if (!target) continue;

            options.push(
                new StringSelectMenuOptionBuilder()
                    .setLabel(`${target.user.username} #${order.orderId}`)
                    .setDescription(`ID: ${order.id}`)
                    .setValue(`${order.userid}#${order.orderId}`)
            )
        }

        const menu: StringSelectMenuBuilder = new StringSelectMenuBuilder()
            .setCustomId('main')
            .setPlaceholder('Choose a job to assign to a worker!')
            .addOptions(options)

        const row: ActionRowBuilder<AnyComponentBuilder> = new ActionRowBuilder().addComponents(menu);
        //@ts-ignore
        const int: Message<boolean> & InteractionResponse<boolean> =  await interaction.reply({content: 'These are your currently ongoing jobs!', components: [row], ephemeral: true});

        const collector: InteractionCollector<StringSelectMenuInteraction<CacheType>> = await int.createMessageComponentCollector({
            componentType: ComponentType.SelectMenu,
            time: 120000,
            idle: 60000
        });

        collector.on('collect', async (data: StringSelectMenuInteraction<CacheType>): Promise<void> => {
            const splitUp: string[] = data.values[0].split('#');
            const orderData: Order | null = await db.findSpecificOrder(splitUp[0], parseInt(splitUp[1]));

            if (orderData) {
                const modal: ModalBuilder = new ModalBuilder().setCustomId('assignModal').setTitle('Assign job to worker');

                const haveComponent: TextInputBuilder = new TextInputBuilder().setCustomId('assignUser').setLabel('Enter worker username').setStyle(TextInputStyle.Short).setMaxLength(32).setMinLength(4).setRequired(true);
                const hasComponent: TextInputBuilder = new TextInputBuilder().setCustomId('assignJob').setLabel('Job ID (DO NOT TOUCH)').setValue(orderData.id).setStyle(TextInputStyle.Short).setMaxLength(40).setMinLength(36).setRequired(true);

                const firstActionRow: ActionRowBuilder<AnyComponentBuilder> = new ActionRowBuilder().addComponents(haveComponent);
                const secondActionRow: ActionRowBuilder<AnyComponentBuilder> = new ActionRowBuilder().addComponents(hasComponent);

                //@ts-ignore
                modal.addComponents(firstActionRow, secondActionRow);

                return data.showModal(modal);
            }
        });

        collector.on('end',  async(): Promise<void> => {
            await int.edit({content: 'Ended, the collector was ended!', components: []});
        });

        return;
    },
});