import { contextBridge, ipcMain, ipcRenderer, shell } from 'electron';
import { log } from 'electron-log';
import { updateClient } from '../../services/updater';
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
        updateClient().then(() => {
            log("Lancement du jeu...");
            ipcRenderer.send('launch', username);
        }).catch((err) => {
            log("Erreur lors de la mise à jour du client: " + err);
        });
    },
    close: () => {
        log("Fermeture de l'application...");
        ipcRenderer.send('close');
    },
});

export async function setLoadText(text: string) {
    document.getElementById("loadText")!.innerHTML = text;
}

export async function setLogText(text: string) {
    document.getElementById("loadProgressText")!.innerHTML = text;
}

export async function setProgressBar(value: number) {
    let roundedvalue = value.toFixed(2)
    document.getElementById("progressBar")!.style.width = roundedvalue + "%";
    document.getElementById("progressBar")!.innerHTML = roundedvalue + "%";
}



import chokidar from 'chokidar';
const isdev = process.env.NODE_ENV === 'development';
if (isdev) {
    chokidar.watch(path.join(__dirname, "../..")).on('all', (event, path) => {
        if (event === 'change') {
            window.location.reload();
        }
    });
}

export async function setloadProgressText(Key: string) {
    const maxLength = 45;
    const truncatedString = Key.substr(0, maxLength) + (Key.length > maxLength ? "..." : "");
	document.getElementById("loadProgressText")!.innerHTML = truncatedString;
}
