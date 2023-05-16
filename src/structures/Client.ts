import {
    ActivityType,
    ApplicationCommandDataResolvable,
    ApplicationCommandType,
    Client,
    ClientEvents,
    Collection,
} from 'discord.js';
import glob from 'glob';
import { promisify } from 'util';
import { Event } from './Event';
import { RegisterCommandsOptions, CommandType, MenuType } from '../@types';
import {ModalType} from '../@types/Command'
import path from 'path';
import logger from '../utils/logger';
import { hasUpperCase } from "../utils/misc";

const globPromise = promisify(glob);

export class ExtendedClient extends Client {
    commands: Collection<string, CommandType> = new Collection();
    contextmenus: Collection<string, MenuType> = new Collection();
    modals: Collection<string, ModalType> = new Collection();

    constructor() {
        super({ intents: 37379, waitGuildTimeout: 1000 });
    }

    start() {
        this.registerModules();
        this.login(process.env.token);
    }

    async importFile(filePath: string) {
        return (await import(filePath))?.default;
    }

    async registerCommands({ commands, guildId }: RegisterCommandsOptions) {
        if (guildId) {
            this.guilds.cache.get(guildId)?.commands.set(commands);
        } else {
            this.application?.commands.set(commands);
        }
    }

    async registerModules() {
        // Commands
        const globalCommands: ApplicationCommandDataResolvable[] = [];
        const guildSpecfic: ApplicationCommandDataResolvable[] = [];

        const root = path.join(__dirname, '..');
        const commandFiles = await globPromise('/commands/*/*{.ts,.js}', {root});
        const modalFiles = await globPromise('/modals/*/*{.ts,.js}', {root});

        for (const filePath of commandFiles) {
            const command: CommandType | MenuType = await this.importFile(filePath);
            if (!command.name) continue;

            if (command?.main) {
                guildSpecfic.push(command);
                if (hasUpperCase(command.name)) {
                    logger.command(`Loaded guild contextmenu command "${command.name}"!`);
                } else {
                    logger.command(`Loaded guild command "${command.name}"!`);
                }
            } else {
                globalCommands.push(command);
                if (hasUpperCase(command.name)) {
                    logger.command(`Loaded global contextmenu command "${command.name}"!`);
                } else {
                    logger.command(`Loaded global command "${command.name}"!`);
                }
            }
            if (command.type === ApplicationCommandType.ChatInput) {
                this.commands.set(command.name, command);
            } else {
                this.contextmenus.set(command.name, command as MenuType);
            }
        }

        for (const filePath of modalFiles) {
            const modal: ModalType = await this.importFile(filePath);
            if (!modal.customId) continue;

            this.modals.set(modal.customId, modal as ModalType);
        }

        this.on('ready', () => {
            this.registerCommands({
                commands: globalCommands,
            });
            this.registerCommands({
                commands: guildSpecfic,
                guildId: process.env.guildId,
            });
            this.user?.setActivity({
                type: ActivityType.Watching,
                name: 'In Development',
            });
        });

        // Events
        const eventFiles = await globPromise('/events/*{.ts,.js}', {root});
        for (const filePath of eventFiles) {
            const event: Event<keyof ClientEvents> = await this.importFile(filePath);
            logger.event(`Loaded event "${event.event}"!`);
            this.on(event.event, event.run);
        }
    }
}