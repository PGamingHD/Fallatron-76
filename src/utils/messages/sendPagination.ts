import {
    ActionRowBuilder,
    APIEmbed,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    CacheType,
    Collection,
    CommandInteraction,
    ComponentType,
    InteractionCollector,
    Message,
} from 'discord.js';
import logger from '../logger';

export default async function (interaction: CommandInteraction, pages: APIEmbed[], time = 60000, idle = 60000) {
    try {
        if (!interaction) throw new Error('Invalid interaction provided');
        if (!pages) throw new Error('No pages provided');
        if (!Array.isArray(pages)) throw new Error('Pages must be an array');

        if (typeof time !== 'number') throw new Error('Time must be a number');
        if (time < 30000) throw new Error('Time must be more than 30 seconds');
        if (idle < 30000) throw new Error('Idle time must be more than 30 seconds');

        if (!interaction.deferred) await interaction.deferReply();

        if (pages.length === 1) {
            const page = await interaction.editReply({
                embeds: pages,
                components: [],
            });

            return page;
        }

        let maxBack: ButtonBuilder;
        if (pages.length >= 5) {
            maxBack = new ButtonBuilder()
                .setCustomId('maxBack')
                .setEmoji('⏪')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(false);
        }

        const prev: ButtonBuilder = new ButtonBuilder()
            .setCustomId('prev')
            .setEmoji('◀')
            .setStyle(ButtonStyle.Success)
            .setDisabled(false);
        const home: ButtonBuilder = new ButtonBuilder()
            .setCustomId('stop')
            .setEmoji('⏹️')
            .setStyle(ButtonStyle.Danger)
            .setDisabled(false);
        const next: ButtonBuilder = new ButtonBuilder()
            .setCustomId('next')
            .setEmoji('▶')
            .setStyle(ButtonStyle.Success)
            .setDisabled(false);

        let maxNext: ButtonBuilder;
        if (pages.length >= 5) {
            maxNext = new ButtonBuilder()
                .setCustomId('maxNext')
                .setEmoji('⏩')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(false);
        }

        let buttonRow: ActionRowBuilder<ButtonBuilder>;
        if (pages.length >= 5) {
            //@ts-ignore
            buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(maxBack, prev, home, next, maxNext);
        } else {
            buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(prev, home, next);
        }

        let index: number = 0;

        const currentPage: Message<boolean> = await interaction.editReply({
            embeds: [pages[index]],
            components: [buttonRow],
        });

        const collector: InteractionCollector<ButtonInteraction<CacheType>> = await currentPage.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time,
            idle
        });

        collector.on('collect', async (i: ButtonInteraction<CacheType>): Promise<void> => {
            try {
                if (i.user.id !== interaction.user.id) return;

                if (!i.deferred) await i.deferUpdate();

                if (i.customId === 'prev') {
                    if (index > 0) {
                        index--
                    } else {
                        index = pages.length - 1;
                    };
                } else if (i.customId === 'stop') {
                    collector.stop('Forced stop');
                } else if (i.customId === 'next') {
                    if (index < pages.length - 1) {
                        index++
                    } else {
                        index = 0;
                    };

                } else if (i.customId === 'maxBack') {
                    if (index === 0) {
                        index = pages.length - 1;
                    } else {
                        index = 0;
                    }
                } else if (i.customId === 'maxNext') {
                    if (index === pages.length - 1) {
                        index = 0;
                    } else {
                        index = pages.length - 1;
                    }
                }

                await currentPage.edit({
                    embeds: [pages[index]],
                    components: [buttonRow],
                });

                collector.resetTimer();
            } catch (e) {
                logger.error(e);
            }
        });

        collector.on('end', async (i: Collection<string, ButtonInteraction<CacheType>>, reason: string): Promise<void> => {
            if (reason === 'messageDelete') return;

            prev.setDisabled(true);
            home.setDisabled(true);
            next.setDisabled(true);

            if (pages.length >= 5) {
                maxNext.setDisabled(true);
                maxBack.setDisabled(true);
            }

            await currentPage.edit({
                embeds: [pages[index]],
                components: [buttonRow]
            });
        });

        return currentPage;
    } catch (e) {
        logger.error(e);
    }
    return;
}