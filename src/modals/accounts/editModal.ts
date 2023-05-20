import {
    ApplicationCommandOptionType,
    ChannelType,
    EmbedBuilder,
    Guild,
    GuildBasedChannel,
    GuildTextBasedChannel,
} from 'discord.js';
import { Modal } from '../../structures/Modal';
import {Colours} from "../../@types/Colours";
import db from "../../utils/database";

export default new Modal({
    customId: 'editModal',
    run: async ({interaction, client, args}) => {
        const username: string = args.getTextInputValue('editUser');
        const password: string = args.getTextInputValue('editPass');
        const jobId: string = args.getTextInputValue('editJob');

        const job: any = await db.findOrder(jobId);

        if (!job) return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('The entered JobID does not seem to exist, did you edit the ID?')]});

        const logGuild: Guild = await client.guilds.fetch(process.env.LOG_GUILD as string);
        const logChannel: GuildBasedChannel | null =  await logGuild.channels.fetch(process.env.LOG_CHANNEL as string) as GuildTextBasedChannel;
        if (logChannel) {
            await logChannel.send({embeds: [new EmbedBuilder().setColor(Colours.YELLOW).setTitle('⚙️ Order credentials changed ⚙️').setDescription(`The job \`${jobId}\` has been updated with new order credentials by ${interaction.user}!`)]});
        }

        await db.updateOrderCredss(jobId, username, password);

        return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.GREEN).setDescription(`You have successfully set new credentials to job \`${jobId}\`!`)]});
    },
});

