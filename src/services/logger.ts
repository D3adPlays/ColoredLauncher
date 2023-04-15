import * as electronLogger from 'electron-log';


export function logInfo(message: string): void {
    electronLogger.info(message);
}