import {ActionRowBuilder, AnyAPIActionRowComponent, ButtonBuilder, ButtonStyle, EmbedBuilder, Events} from 'discord.js';
import { Event } from '../structures/Event';
import { client } from "../bot";
import { escapeRegex } from "../utils/misc";
import {CommandType, TextType} from "../@types/Command";
import {Colours} from "../@types/Colours";


export default new Event(Events.MessageCreate, async (message) => {
    if (!message.guild) return;
    if (message.author.bot) return;
    if (!client || !client.user) return;

    //SUPPORT FOR MULTIPLE / GUILD PREFIXES CAN BE IMPLEMENTED HERE
    const prefix: string = '!';
    const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})`);
    if (!prefixRegex.test(message.content)) return;

    //@ts-ignore
    const [e, mPrefix] = message.content.match(prefixRegex);

    if (!message.content.toLowerCase().startsWith(mPrefix)) return;

    const args: string[] = message.content.slice(mPrefix.length).trim().split(/ +/).filter(Boolean);

    //@ts-ignore
    const cmd: string | null = args.length > 0 ? args.shift().toLowerCase() : null;

    if (!cmd || cmd.length == 0) {
        if (mPrefix.includes(client.user.id)) {
            const buttonrow = new ActionRowBuilder()
            buttonrow.addComponents([
                new ButtonBuilder()
                    .setURL('https://discord.com/api/oauth2/authorize?client_id=' + client.user.id + '&permissions=8&scope=bot%20applications.commands')
                    .setLabel('Invite Me')
                    .setStyle(ButtonStyle.Link)
            ])

            buttonrow.addComponents([
                new ButtonBuilder()
                    .setURL(`https://www.discord.gg/pxySje4GPC`)
                    .setLabel(`Support Server`)
                    .setStyle(ButtonStyle.Link)
            ])

            await message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colours.GREEN)
                        .setAuthor({
                            name: 'Looks like I was pinged? Let me help you a bit!',
                            iconURL: client.user.displayAvatarURL()
                        })
                        .setDescription(`>>> My current prefix is: \`${prefix}\` and \`/\`\n\nTo view all commands please use: \`${prefix}help\` or \`/help\``)
                        .setFooter({
                            text: `Requested by: ${message.author.tag}`
                        })
                        .setTimestamp()
                ],
                //@ts-ignore
                components: [buttonrow]
            });

            await message.delete();
            return;
        }
        return;
    }

    const command: any = client.textcommands.get(cmd.toLowerCase()) || client.commands.find((c: any) => c.aliases?.includes(cmd.toLowerCase()));
    if (!command) return;


    try {
        //@ts-ignore
        await command.run({message, client, args});

        if (command.hidden) {
            await message.delete();
        }
    } catch (error) {
        console.log(error);
    }
});