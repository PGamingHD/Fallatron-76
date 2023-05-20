import chalk from 'chalk';
import moment from 'moment';


export default class logger {
    static log(text: any): void {
        const date = `${moment().format("DD-MM-YYYY hh:mm:ss")}`;
        return console.log(`[${chalk.gray(date)}]: [${chalk.black.bgBlue('LOG')}] ${text}`);
    }

    static debug(text: any): void {
        const date = `${moment().format("DD-MM-YYYY hh:mm:ss")}`;
        return console.log(`[${chalk.gray(date)}]: [${chalk.black.bgGreen('DEBUG')}] ${text}`);
    }

    static shard(text: any): void {
        const date = `${moment().format("DD-MM-YYYY hh:mm:ss")}`;
        return console.log(`[${chalk.gray(date)}]: [${chalk.black.bgYellowBright('SHARD')}] ${text}`);
    }

    static warning(text: any): void {
        const date = `${moment().format("DD-MM-YYYY hh:mm:ss")}`;
        return console.log(`[${chalk.gray(date)}]: [${chalk.black.bgYellow('WARNING')}] ${text}`);
    }

    static error(text: any): void {
        const date = `${moment().format("DD-MM-YYYY hh:mm:ss")}`;
        return console.log(`[${chalk.gray(date)}]: [${chalk.black.bgRed('ERROR')}] ${text}`);
    }

    static command(text: any): void {
        const date = `${moment().format("DD-MM-YYYY hh:mm:ss")}`;
        return console.log(`[${chalk.gray(date)}]: [${chalk.black.bgBlue('COMMAND')}] ${text}`);
    }

    static text(text: any): void {
        const date = `${moment().format("DD-MM-YYYY hh:mm:ss")}`;
        return console.log(`[${chalk.gray(date)}]: [${chalk.black.bgGreenBright('TEXTCMD')}] ${text}`);
    }

    static event(text: any): void {
        const date = `${moment().format("DD-MM-YYYY hh:mm:ss")}`;
        return console.log(`[${chalk.gray(date)}]: [${chalk.black.bgWhite('EVENT')}] ${text}`);
    }
}