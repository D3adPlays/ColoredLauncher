import {BrowserWindow} from 'electron';
import path from 'path';

let mainWindow: BrowserWindow;

export function getMainWindow(): BrowserWindow {
    return mainWindow;
}

export function createMainWindow(isdev: Boolean): void {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        minWidth: 1280,
        minHeight: 720,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, '..', '/web/mainWindow/preload.js'),
            devTools: isdev ? true : false
        },
        show: false
    });
    mainWindow.loadFile('./.webpack/web/mainWindow/index.html');
}

export function launchDiscord() {
    throw new Error('Function not implemented.');
}
