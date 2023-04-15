import { app, BrowserWindow, dialog } from 'electron';
import * as logger from 'electron-log'
import electronReload from 'electron-reload';
import { checkForUpdates } from './services/autoUpdater';

export const isdev = process.env.NODE_ENV === 'development';
// HOT RELOAD
if (isdev) {
    electronReload(__dirname, {forceHardReset: true});
}
import * as mainWindow from './windows/mainWindow';
import * as autoUpdater from './services/autoUpdater';

import * as updaterWindow from './windows/updaterWindow';

app.on('ready', () => {
    main();
});

async function main() {
    logger.transports.console.format = '[{h}:{i}:{s}] [ColoredV2] >> {text}';
    logger.log('App is ready');
    logger.log('Is dev: ' + isdev);
    updaterWindow.createUpdateWindow(isdev);
    await checkForUpdates().then(() => {
        logger.log('Update check done');
    });
    mainWindow.createMainWindow(isdev);
    updaterWindow.destroyUpdaterWindow();
    mainWindow.getMainWindow().once('ready-to-show', () => {
        mainWindow.getMainWindow().show();
        isdev ? mainWindow.getMainWindow().webContents.openDevTools() : null;
    });
}