require("dotenv").config();
import {ShardingManager} from "discord.js";
import logger from './utils/logger';

const manager = new ShardingManager(__dirname + '/bot.ts', {
    token: process.env.TOKEN,
    execArgv: ['-r', 'ts-node/register']
});

manager.on('shardCreate', shard => {
    logger.shard(`Launched shard ${shard.id}`);
});

manager.spawn({timeout: -1});

