import logger from "./logger";

export function generateErrorID(): string {
    return (Math.random() + 1).toString(36).substring(3);
}

export function capitalize(string: string): string {
    var toReturn: string = string
    try {
        toReturn = string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    } catch (e) {
        toReturn = string
    }

    return toReturn
}

export function formatSeconds(seconds: number) {
    const hours: number = Math.floor(seconds / (60 * 60));
    const minutes: number = Math.floor((seconds % (60 * 60)) / 60);
    const secs: number = Math.floor(seconds % 60);
    const time: string[] = [];
    if (hours >= 1) time.push(`${hours}h`);
    if (minutes >= 1) time.push(`${minutes}m`);
    if (seconds >= 1) time.push(`${secs}s`);

    return time.join(' ');
}

export function escapeRegex(str: string) {
    try {
        return str.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
    } catch (e) {
        return logger.error(e);
    }
}

export function hasUpperCase(str: string) {
    return str !== str.toLowerCase();
}