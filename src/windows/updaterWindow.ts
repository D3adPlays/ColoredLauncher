// import the module
import { BrowserWindow, BrowserWindowConstructorOptions } from "electron";
import path from 'path';

let updateWindow: BrowserWindow;

export async function createUpdateWindow(isdev: Boolean) {
    updateWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        minWidth: 1280,
        minHeight: 720,
        opacity: 0,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, '..', '/web/updaterWindow/preload.js'),
            devTools: isdev ? true : false
        },
        show: false
    });
    updateWindow.loadFile('./.webpack/web/updaterWindow/index.html');
    updateWindow.once('ready-to-show', () => {
        fadeInWindow(updateWindow);
    });
}

console.log("test");

async function fadeInWindow(window: BrowserWindow): Promise<void> {
    return new Promise((resolve) => {
        window.setOpacity(0);
        window.show();
        for (let i = 0; i < 100; i++) {
            setTimeout(() => {
                window.setOpacity(i / 100);
            }, 10 * i);
        }
        window.setOpacity(1);
        resolve();
    });
}
function fadeOutWindow(window: BrowserWindow): Promise<void> {
    return new Promise((resolve) => {
        try {
            window.setOpacity(1);
            for (let i = 100; i > 0; i--) {
                setTimeout(() => {
                    window.setOpacity(i / 100);
                }, 10 * i);
            }
            window.hide();
            window.setOpacity(0);
        } catch (error) {}
        resolve();
    });
}
export async function destroyUpdaterWindow() {
    updateWindow.destroy();
}

