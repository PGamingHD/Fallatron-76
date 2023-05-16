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
    customId: 'assignModal',

    run: async ({interaction, client, args}) => {
        const username: string = args.getTextInputValue('assignUser');
        const jobId: string = args.getTextInputValue('assignJob');

        const exists: any = await db.validateUsername(username.toLowerCase());
        const job: any = await db.findOrder(jobId);

        if (!job) return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('The entered JobID does not seem to exist, did you edit the ID?')]});
        if (!exists) return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('The entered username does not seem to exist, did you make a typo?')]});
        if (exists.useraccount.type !== "WORKER" && exists.useraccount.type !== "MANAGER" && exists.useraccount.type !== "OWNER") return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('The user chosen does not seem to be of rank Worker+')]});

        const logGuild: Guild = await client.guilds.fetch(process.env.LOG_GUILD as string);
        const logChannel: GuildBasedChannel | null =  await logGuild.channels.fetch(process.env.LOG_CHANNEL as string) as GuildTextBasedChannel;
        if (logChannel) {
            await logChannel.send({embeds: [new EmbedBuilder().setColor(Colours.YELLOW).setTitle('⚙️ New job assigned ⚙️').setDescription(`The job \`${jobId}\` has been assigned to user ${exists.username} by user ${interaction.user}`)]});
        }

        await db.updateOrderAccess(jobId, exists.userid);

        return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.GREEN).setDescription(`You have successfully set the user with job \`${jobId}\`!`)]});
    },
});

