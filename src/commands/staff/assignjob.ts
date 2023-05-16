import {
    APIEmbed,
    ApplicationCommandOptionType,
    ButtonStyle,
    ChannelType,
    ComponentType,
    EmbedBuilder,
    Guild,
    GuildBasedChannel,
    GuildTextBasedChannel,
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
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: 'username',
            description: 'Registered username',
            required: true,
        },
        {
            type: ApplicationCommandOptionType.String,
            name: 'jobid',
            description: 'The Job ID',
            required: true
        }
    ],
    run: async ({ interaction, client }) => {
        if (!interaction.guild) return;
        const user: any = await db.findLoggedIn(interaction.user.id as string);
        if (!user) return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('You do not seem to be logged in, please login before using this command.')]});

        const username: string | null = interaction.options.getString('username');

        if (!username) return;

        const {useraccount} = user;

        if (useraccount.type !== "OWNER") return interaction.followUp({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('You do not have access to this command, you require the permission \`OWNER\` to execute this command.')]})

        const target: any = await db.findUsername(username);

        if (!target) return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('The user chosen for a job does not seem to be valid.')]})
        if (target.useraccount.type !== "WORKER" && target.useraccount.type !== "MANAGER" && target.useraccount.type !== "OWNER") return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('The user chosen does not seem to be of rank Worker+')]});

        const jobid: string | null = interaction.options.getString('jobid');

        if (!jobid) return;

        const job: Order | null = await db.findOrder(jobid);

        if (!job) return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('The specified job does not exist, is the JOB ID correct?')]})

        if (job.access) return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.RED).setDescription('The specific job has already been claimed, please use the /reassignjob command.')]})

        const logGuild: Guild = await client.guilds.fetch(process.env.LOG_GUILD as string);
        const logChannel: GuildBasedChannel | null =  await logGuild.channels.fetch(process.env.LOG_CHANNEL as string) as GuildTextBasedChannel;
        if (logChannel) {
            await logChannel.send({embeds: [new EmbedBuilder().setColor(Colours.YELLOW).setTitle('⚙️ New job assigned ⚙️').setDescription(`The job \`${jobid}\` has been assigned to user ${target.username} by user ${interaction.user}`)]});
        }

        await db.updateOrderAccess(job.id, target.userid);

        return interaction.reply({ephemeral: true, embeds: [new EmbedBuilder().setColor(Colours.GREEN).setDescription(`You have successfully set the user with job \`${jobid}\`!`)]});
    },
});