import { contextBridge, ipcRenderer } from 'electron';
import { log } from 'electron-log';

//import * as core from "@xmcl/core"



import path from 'path';
contextBridge.exposeInMainWorld('api', {
    log: (message: string) => {
        log(message);
    },
    launchDiscord: () => {
        window.open('https://coloredcity.fr/discord', '_blank');
    },
    launch: (username: string) => {
        log("Démarrage de la procédure de lancement...");
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
