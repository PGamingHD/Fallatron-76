import {ExtendedClient} from './structures/Client';
import logger from './utils/logger';

export const client = new ExtendedClient();

client.start();

client.on('warn', (e: any) => logger.warning(e));
client.on('debug', (e: any) => logger.debug(e));
client.on('error', (e: any) => logger.warning(e));

process.on('unhandledRejection', (e: any) => logger.error(e));
process.on('uncaughtException', (e: any) => logger.error(e));