import { contextBridge, ipcMain, ipcRenderer, shell } from 'electron';
import { log } from 'electron-log';
import path from 'path';


contextBridge.exposeInMainWorld('api', {
    log: (message: string) => {
        log(message);
    },
    launchDiscord: () => {
        shell.openExternal("https://coloredcity.fr/discord");
    },
    launch: (username: string) => {
        log("Démarrage de la procédure de lancement...");
    },
    close: () => {
        log("Fermeture de l'application...");
        ipcRenderer.send('close');
    },
});

import chokidar from 'chokidar';
const isdev = process.env.NODE_ENV === 'development';
if (isdev) {
    chokidar.watch(path.join(__dirname, "../..")).on('all', (event, path) => {
        if (event === 'change') {
            window.location.reload();
        }
    });
}
