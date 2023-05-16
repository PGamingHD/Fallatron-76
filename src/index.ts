import {ShardingManager} from "discord.js";
import logger from './utils/logger';
require("dotenv").config();

const manager: ShardingManager = new ShardingManager(__dirname + '/bot.js', {
    token: process.env.TOKEN,
});

manager.on('shardCreate', shard => {
    logger.shard(`Launched shard ${shard.id}`);
});

manager.spawn({timeout: -1});

