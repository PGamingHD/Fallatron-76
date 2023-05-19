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
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    StringSelectMenuOptionBuilder,
    TextInputStyle
} from 'discord.js';
import { Command } from '../../structures/Command';
import {Colours} from "../../@types/Colours";
import {Order} from "@prisma/client";
import db from "../../utils/database";

export default new Command({
    name: 'getjobs',
    description: 'Get your own personal jobs that has been assigned to you',
    modalCommand: true,
    run: async ({ interaction, client }) => {
        if (!interaction.guild) return;
        const user: any = await db.findLoggedIn(interaction.user.id as string);
        if (!user) return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('You do not seem to be logged in, please login before using this command.')]});

        const {useraccount} = user;

        if (useraccount.type !== "WORKER" && useraccount.type !== "MANAGER" && useraccount.type !== "OWNER") return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('You do not have access to this command, you require the permission \`WORKER+\` to execute this command.')]})

        const personalOrders: Order[] = await db.findAllOrders(interaction.user.id);

        if (personalOrders.length === 0) return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('You do not currently have any jobs, please ask one of the owners to assign you one first.')]})

        let options: any[] = [];
        for (let order of personalOrders) {
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
            .setPlaceholder('Choose a job to get information on!')
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
                const cancel: ButtonBuilder = new ButtonBuilder()
                    .setCustomId('cancel')
                    .setLabel('Cancel')
                    .setEmoji('❌')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(false);

                const exit: ButtonBuilder = new ButtonBuilder()
                    .setCustomId('exit')
                    .setLabel('Exit')
                    .setEmoji('⏹️')
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(false);


                const complete: ButtonBuilder = new ButtonBuilder()
                    .setCustomId('complete')
                    .setLabel('Complete')
                    .setEmoji('✅')
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(false);

                const buttonRow: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>().addComponents(cancel, exit, complete);

                let newNum: number;

                if (!orderData.openTimes) {
                    newNum = 1;
                } else {
                    newNum = orderData.openTimes + 1;
                }

                await db.updateOrderOpen(orderData.id, newNum);

                const newInt: InteractionResponse = await data.update({
                    content: '',
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colours.GREEN)
                            .setTitle(`Order: ${orderData.id}`)
                            .setDescription(`\`\`\`ID: ${orderData.id}\nUsername: ${orderData.username} (${orderData.userid})\nStatus: ${orderData.status}\nCreated At: ${orderData.createdAt}\n\nAccount Username: ${orderData.user}\nAccount Password: ${orderData.pass}\`\`\`\n\n**Todo:**\n\`\`\`${orderData.todo}\`\`\``)
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

                        const logGuild: Guild = await client.guilds.fetch(process.env.LOG_GUILD as string);
                        const logChannel: GuildBasedChannel | null =  await logGuild.channels.fetch(process.env.LOG_CHANNEL as string) as GuildTextBasedChannel;
                        if (logChannel) {
                            await logChannel.send({embeds: [new EmbedBuilder().setColor(Colours.YELLOW).setTitle('⚙️ Order cancelled ⚙️').setDescription(`The job \`${orderData.id}\` has been set to cancelled status by user ${interaction.user}`)]});
                        }

                        cancel.setDisabled(true);
                        complete.setDisabled(true);
                        exit.setDisabled(true);

                        await data.update({
                            content: 'Order status changed to cancelled, you may dismiss this message now.',
                            components: [buttonRow]
                        });

                        collector.stop();
                    }

                    if (data.customId === "complete") {
                        await db.updateOrderStatus(orderData.id, 'COMPLETED');
                        await db.updateOrderCreds(orderData.id);

                        const logGuild: Guild = await client.guilds.fetch(process.env.LOG_GUILD as string);
                        const logChannel: GuildBasedChannel | null =  await logGuild.channels.fetch(process.env.LOG_CHANNEL as string) as GuildTextBasedChannel;
                        if (logChannel) {
                            await logChannel.send({embeds: [new EmbedBuilder().setColor(Colours.YELLOW).setTitle('⚙️ Order completed ⚙️').setDescription(`The job \`${orderData.id}\` has been set to completed status by user ${interaction.user}`)]});
                        }

                        cancel.setDisabled(true);
                        complete.setDisabled(true);
                        exit.setDisabled(true);

                        await data.update({
                            content: 'Order status changed to cancelled, you may dismiss this message now.',
                            components: [buttonRow]
                        });

                        collector.stop();
                    }

                    if (data.customId === "exit") {
                        cancel.setDisabled(true);
                        complete.setDisabled(true);
                        exit.setDisabled(true);

                        await data.update({
                            content: 'Exited from collector, you may dismiss this message now.',
                            components: [buttonRow]
                        });

                        collector.stop();
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