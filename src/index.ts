import { app, dialog, ipcMain, ipcRenderer } from 'electron';
import * as logger from 'electron-log'
import electronReload from 'electron-reload';
import { checkForUpdates } from './services/autoUpdater';

export const isdev = process.env.NODE_ENV === 'development';
// HOT RELOAD
if (isdev) {
    electronReload(__dirname, {forceHardReset: true});
}
import * as mainWindow from './windows/mainWindow';
import * as updaterWindow from './windows/updaterWindow';
import path from 'path';

app.on('ready', () => {
    main();
});

async function main() {
    logger.transports.console.format = '[{h}:{i}:{s}] [ColoredV2] >> {text}';
    logger.log('App is ready');
    logger.log('Is dev: ' + isdev);
    //transcript to log file
    logger.transports.file.level = 'info';
    logger.transports.file.fileName = 'launcher.log';
    logger.transports.file.resolvePath = (variables: any) => {
        return path.join(__dirname, "/logs/launcher.log");
    };

    //check for launcher maintenance
    updaterWindow.createUpdateWindow(isdev);
    logger.log('Checking for maintenance');
    await checkMaintenance();
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

ipcMain.on('close', () => {
    app.quit();
});

function checkMaintenance(): Promise<void> {
    return new Promise(async (resolve, reject) => {
        if (isdev) {
            logger.log('Launcher is not in maintenance');
            resolve();
            return;
        }
        let launcherStatus: string = await fetch('https://www.coloredcity.fr/api/status.cfg').catch(
            (error: any) => {
                logger.log('Error while checking maintenance: ' + error);
                const errorMessage: string = error ? "Erreur lors de la connection au serveur:\n" + error : 'Erreur inconnue';
                dialog.showMessageBoxSync({
                    type: 'error',
                    title: 'Erreur',
                    message: errorMessage,
                    buttons: ['OK']
                });
                reject();
                app.quit();
                return;
            }
        ).then((response: any) => {
            return response.text();
        });
        if (launcherStatus != 'ok') {
            logger.log('Launcher is in maintenance');
            //show maintenance window
            dialog.showMessageBoxSync({
                type: 'error',
                title: 'Maintenance du launcher',
                message: launcherStatus,
                buttons: ['OK']
            });
            app.quit();
            return;
        }
        logger.log('Launcher is not in maintenance');
        resolve();
    });
}
