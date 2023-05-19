import {
    ActionRowBuilder,
    AnyComponentBuilder,
    APIEmbed,
    ApplicationCommandOptionType,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    CacheType,
    ChannelType,
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
import { Command } from '../../structures/Command';
import {Colours} from "../../@types/Colours";
import {Order, user} from "@prisma/client";
import db from "../../utils/database";

export default new Command({
    name: 'listjobs',
    description: 'List all jobs, no matter if claimed or completed (HEAVY)',
    modalCommand: true,
    run: async ({ interaction, client }) => {
        if (!interaction.guild) return;
        const user: any = await db.findLoggedIn(interaction.user.id as string);
        if (!user) return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('You do not seem to be logged in, please login before using this command.')]});

        const {useraccount} = user;

        if (useraccount.type !== "OWNER") return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('You do not have access to this command, you require the permission \`OWNER\` to execute this command.')]})

        const personalOrders: Order[] = await db.findAllOOrders();

        if (personalOrders.length === 0) return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('There are no existing jobs currently added, add a new one with the /neworder command.')]});

        let options: any[] = [];
        for (let order of personalOrders) {
            let target = null;

            const guild: Guild = await client.guilds.fetch(process.env.MAIN_GUILD as string);
            try {
                const test: GuildMember = await guild.members.fetch(order.userid);

                if (test) target = test;
            } catch {}

            if (!target) continue;

            let claimStatus: string = 'UNCLAIMED';
            if (order.access) {
                const claimer: user | null = await db.findUserId(order.access);
                claimStatus = `CLAIMED BY "${claimer?.username}"`;
            }

            options.push(
                new StringSelectMenuOptionBuilder()
                    .setLabel(`${target.user.username} #${order.orderId} (${order.status}) [${claimStatus}]`)
                    .setDescription(`ID: ${order.id}`)
                    .setValue(`${order.userid}#${order.orderId}`)
            )
        }

        const menu: StringSelectMenuBuilder = new StringSelectMenuBuilder()
            .setCustomId('main')
            .setPlaceholder('Choose a job to get information on!')
            .addOptions(options)

        const row: ActionRowBuilder<AnyComponentBuilder> = new ActionRowBuilder().addComponents(menu);
        //@ts-ignore
        const int: Message<boolean> & InteractionResponse<boolean> =  await interaction.reply({content: 'These are all available jobs!', components: [row], ephemeral: true});

        const collector: InteractionCollector<StringSelectMenuInteraction<CacheType>> = await int.createMessageComponentCollector({
            componentType: ComponentType.SelectMenu,
            time: 120000,
            idle: 60000
        });

        collector.on('collect', async (data: StringSelectMenuInteraction<CacheType>): Promise<void> => {
            const splitUp: string[] = data.values[0].split('#');
            const orderData: Order | null = await db.findSpecificOrder(splitUp[0], parseInt(splitUp[1]));

            if (orderData) {
                const cancel: ButtonBuilder = new ButtonBuilder()
                    .setCustomId('cancel')
                    .setLabel('Cancel')
                    .setEmoji('❌')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(false);

                const exit: ButtonBuilder = new ButtonBuilder()
                    .setCustomId('assign')
                    .setLabel('Assign')
                    .setEmoji('👤')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(false);

                const del: ButtonBuilder = new ButtonBuilder()
                    .setCustomId('delete')
                    .setLabel('Delete')
                    .setEmoji('🧨')
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(false);

                const pending: ButtonBuilder = new ButtonBuilder()
                    .setCustomId('pending')
                    .setLabel('Pending')
                    .setEmoji('⏰')
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(false);


                const complete: ButtonBuilder = new ButtonBuilder()
                    .setCustomId('complete')
                    .setLabel('Complete')
                    .setEmoji('✅')
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(false);

                const buttonRow: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>().addComponents(cancel, exit, del, pending, complete);

                const newInt: InteractionResponse<boolean> = await data.update({
                    content: '',
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colours.GREEN)
                            .setTitle(`Order: ${orderData.id}`)
                            .setDescription(`\`\`\`ID: ${orderData.id}\nUsername: ${orderData.username} (${orderData.userid})\nStatus: ${orderData.status}\nCreated At: ${orderData.createdAt}\nOrder Worker: ${orderData.access === null ? "Not assigned" : orderData.access}\nCredentials Accessed: ${orderData.openTimes === null ? '0' : orderData.openTimes} times\n\nAccount Username: ${orderData.user}\nAccount Password: ${orderData.pass}\`\`\`\n\n**Todo:**\n\`\`\`${orderData.todo}\`\`\``)
                    ],
                    components: [buttonRow]
                });

                const collector: InteractionCollector<ButtonInteraction<CacheType>> = await newInt.createMessageComponentCollector({
                    componentType: ComponentType.Button,
                    time: 120000,
                    idle: 60000
                });

                collector.on('collect', async (data: ButtonInteraction<CacheType>): Promise<void> => {
                    if (data.customId === "cancel") {
                        await db.updateOrderStatus(orderData.id, 'CANCELLED');
                        await db.updateOrderCreds(orderData.id);

                        const logGuild: Guild | null = await client.guilds.fetch(process.env.LOG_GUILD as string);
                        const logChannel: GuildBasedChannel | null =  await logGuild.channels.fetch(process.env.LOG_CHANNEL as string) as GuildTextBasedChannel;
                        if (logChannel) {
                            await logChannel.send({embeds: [new EmbedBuilder().setColor(Colours.YELLOW).setTitle('⚙️ Order cancelled ⚙️').setDescription(`The job \`${orderData.id}\` has been set to cancelled status by user ${interaction.user}`)]});
                        }

                        cancel.setDisabled(true);
                        complete.setDisabled(true);
                        exit.setDisabled(true);
                        del.setDisabled(true);
                        pending.setDisabled(true);

                        await data.update({
                            content: 'Collection ended, you may close this now!',
                            components: [buttonRow]
                        });

                        collector.stop();
                    }

                    if (data.customId === "complete") {
                        await db.updateOrderStatus(orderData.id, 'COMPLETED');
                        await db.updateOrderCreds(orderData.id);

                        const logGuild: Guild | null = await client.guilds.fetch(process.env.LOG_GUILD as string);
                        const logChannel: GuildBasedChannel | null =  await logGuild.channels.fetch(process.env.LOG_CHANNEL as string) as GuildTextBasedChannel;
                        if (logChannel) {
                            await logChannel.send({embeds: [new EmbedBuilder().setColor(Colours.YELLOW).setTitle('⚙️ Order completed ⚙️').setDescription(`The job \`${orderData.id}\` has been set to completed status by user ${interaction.user}`)]});
                        }

                        cancel.setDisabled(true);
                        complete.setDisabled(true);
                        exit.setDisabled(true);
                        del.setDisabled(true);
                        pending.setDisabled(true);

                        await data.update({
                            content: 'Collection ended, you may close this now!',
                            components: [buttonRow]
                        });

                        collector.stop();
                    }

                    if (data.customId === "pending") {
                        await db.updateOrderStatus(orderData.id, 'PENDING');

                        const logGuild: Guild | null = await client.guilds.fetch(process.env.LOG_GUILD as string);
                        const logChannel: GuildBasedChannel | null =  await logGuild.channels.fetch(process.env.LOG_CHANNEL as string) as GuildTextBasedChannel;
                        if (logChannel) {
                            await logChannel.send({embeds: [new EmbedBuilder().setColor(Colours.YELLOW).setTitle('⚙️ Order pending ⚙️').setDescription(`The job \`${orderData.id}\` has been set to pending status by user ${interaction.user}`)]});
                        }

                        cancel.setDisabled(true);
                        complete.setDisabled(true);
                        exit.setDisabled(true);
                        del.setDisabled(true);
                        pending.setDisabled(true);

                        await data.update({
                            content: 'Collection ended, you may close this now!',
                            components: [buttonRow]
                        });

                        collector.stop();
                    }

                    if (data.customId === "delete") {
                        await db.delOrder(orderData.id);

                        const logGuild: Guild | null = await client.guilds.fetch(process.env.LOG_GUILD as string);
                        const logChannel: GuildBasedChannel | null =  await logGuild.channels.fetch(process.env.LOG_CHANNEL as string) as GuildTextBasedChannel;
                        if (logChannel) {
                            await logChannel.send({embeds: [new EmbedBuilder().setColor(Colours.YELLOW).setTitle('⚙️ Order deleted ⚙️').setDescription(`The job \`${orderData.id}\` has been deleted by user ${interaction.user}`)]});
                        }

                        cancel.setDisabled(true);
                        complete.setDisabled(true);
                        exit.setDisabled(true);
                        del.setDisabled(true);
                        pending.setDisabled(true);

                        await data.update({
                            content: 'Collection ended, you may close this now!',
                            components: [buttonRow]
                        });

                        collector.stop();
                    }

                    if (data.customId === "assign") {
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
            }
        });

        collector.on('end',  async(): Promise<void> => {
            await int.edit({content: 'Ended, the collector was ended!', components: []});
        });

        return;
    },
});