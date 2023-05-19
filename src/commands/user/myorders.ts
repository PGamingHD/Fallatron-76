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
import db from "../../utils/database";
import {Order, user} from "@prisma/client";

export default new Command({
    name: 'myorders',
    description: 'Get all your ongoing orders',
    modalCommand: true,
    run: async ({ interaction, client }) => {
        const loggedIn: user | null = await db.findLoggedIn(interaction.user.id);

        if (!loggedIn) return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('You do not seem to be logged in, please login before using this command.')]});
        if (!loggedIn.loggedinid) return;

        const myOrders: Order[] = await db.findAllUOrders(loggedIn.loggedinid);

        if (myOrders.length === 0) return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('You do not currently have any orders, is this your own account and do you have ongoing previous orders?')]});

        let options: any[] = [];
        for (let order of myOrders) {
            let target = null;

            const guild: Guild | null = interaction.guild;
            if (!guild) continue;

            try {
                const test: GuildMember = await guild.members.fetch(order.userid);

                if (test) target = test;
            } catch {}

            if (!target) continue;

            options.push(
                new StringSelectMenuOptionBuilder()
                    //@ts-ignore
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
        const int: Message<boolean> & InteractionResponse<boolean> =  await interaction.reply({content: 'These are your own orders!', components: [row], ephemeral: true});

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
                    .setCustomId('edit')
                    .setLabel('Edit')
                    .setEmoji('🖊️')
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(false);

                const buttonRow: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>().addComponents(cancel, exit, complete);

                const newInt: InteractionResponse<boolean> = await data.update({
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

                    if (data.customId === "edit") {
                        const modal: ModalBuilder = new ModalBuilder().setCustomId('editModal').setTitle('Edit your order credentials');

                        const haveComponent: TextInputBuilder = new TextInputBuilder().setCustomId('editUser').setLabel('New account username').setStyle(TextInputStyle.Short).setMaxLength(32).setMinLength(4).setRequired(true);
                        const hasComponent: TextInputBuilder = new TextInputBuilder().setCustomId('editPass').setLabel('New account password').setStyle(TextInputStyle.Short).setMaxLength(32).setMinLength(4).setRequired(true);
                        const hassComponent: TextInputBuilder = new TextInputBuilder().setCustomId('editJob').setLabel('Job ID (DO NOT TOUCH)').setValue(orderData.id).setStyle(TextInputStyle.Short).setMaxLength(40).setMinLength(36).setRequired(true);

                        const firstActionRow: ActionRowBuilder<AnyComponentBuilder> = new ActionRowBuilder().addComponents(haveComponent);
                        const secondActionRow: ActionRowBuilder<AnyComponentBuilder> = new ActionRowBuilder().addComponents(hasComponent);
                        const thirdActionRow: ActionRowBuilder<AnyComponentBuilder> = new ActionRowBuilder().addComponents(hassComponent);

                        //@ts-ignore
                        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

                        return data.showModal(modal);
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

        collector.on('end',  async (): Promise<void> => {
            await int.edit({content: 'Ended, the collector was ended!', components: []});
        });

        return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.GREEN).setDescription('You successfully logged out of your existing account.')]})
    },
});