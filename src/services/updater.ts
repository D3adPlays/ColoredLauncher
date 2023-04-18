import { userInfo } from "os";
import { DownloadServer } from "../types/downloadClient";
import * as launcherProgress from "../web/mainWindow/preload";
import { launcherFile } from "../types/launcherfile";
import { ipcRenderer } from "electron";
import { LaunchOption, MinecraftLocation, launch } from "@xmcl/core";
import { offline } from "@xmcl/user";
import * as logger from "electron-log";
import * as fs from "fs";
import * as path from "path";
import md5File from "md5-file";

const appData: string = userInfo().homedir + "\\AppData\\Roaming\\.ColoredV2\\";
const logPrefix: string = "[ColoredV2]";
export let totalBytes = 0;
export let downloadedBytes = 0;

export function updateClient(): Promise<void> {
	return new Promise(async (resolve, reject) => {
		launcherProgress.setLoadText("Création du dossier de lancement");
		// Création du dossier de lancement
		if (!fs.existsSync(appData)) {
			fs.mkdirSync(appData);
		}
		launcherProgress.setLoadText("Téléchargement des fichiers...");
		installModPack().then(() => {
			resolve();
			logger.log("finished");
		});
	});
}

async function installModPack(): Promise<void> {
	let p = new Promise<void>(async (resolve, reject) => {
		const downloadServer: DownloadServer = new DownloadServer();
		const fileList: launcherFile[] = await downloadServer.getFileList();
		const ignoreList: string[] = await downloadServer.getIgnoreList();
		const deleteList: string[] = await downloadServer.getDeleteList();
		//Suppréssion des fichiers à supprimer
		if (!fs.existsSync(appData)) {
			fs.mkdirSync(appData);
		}
		for (let i = 0; i < deleteList.length; i++) {
			if (fs.existsSync(appData + deleteList[i])) {
				fs.unlinkSync(appData + deleteList[i]);
			}
		}
		//Suppréssion des fichiers présents dans le dossier mais pas dans la liste des fichiers
		logger.log(logPrefix + " Suppression des fichiers non reconnus...");
		removeUnlistedFiles(fileList, appData, ignoreList).then(async () => {
			logger.log(logPrefix + " Suppression terminée.");
			//Suppréssion des dossiers vides
			logger.log(logPrefix + " Suppression des dossiers vides...");
			removeEmptyDirs(appData).then(async () => {
				logger.log(logPrefix + " Suppression terminée.");
				//Téléchargement des fichiers
				logger.log(logPrefix + " Téléchargement des fichiers...");
				updateFiles(fileList, downloadServer).then(() => {
					logger.log(logPrefix + " Téléchargement terminé.");
					launcherProgress.setLoadText("Téléchargement terminé");
					launchGame("GoldenFrite");
					resolve();
				});
			});
		});
	});
}

async function launchGame(username: string) {
	const prefix = "[ColoredV2]";
	const authOffline = offline(username);
	const minecraftLocation: MinecraftLocation = appData;
	document.getElementById("loadText")!.innerHTML = "Lancement du jeu";
	let jrePath = appData + "jrewin\\bin\\java.exe";
	let launchOption: LaunchOption = {
		version: "1.18.2-forge-40.2.1",
		gamePath: minecraftLocation,
		accessToken: authOffline.accessToken,
		gameProfile: authOffline.selectedProfile,
		server: {
			ip: "play.coloredcity.fr",
			port: 25565,
		},
		maxMemory: 4096,
		javaPath: jrePath,
		extraExecOption: {
			detached: true,
		},
	};
	let proc = await launch(launchOption).then((proc) => {
		proc.on("close", (code) => {
			logger.log(prefix, "Minecraft closed with code " + code);
			ipcRenderer.send("show");
		});
		proc.on("error", (err) => {
			logger.log(prefix, "Minecraft error : " + err);
		});
		proc.stdout?.on("data", (data) => {
			logger.log(data.toString());
			if (data.toString().includes("Setting user:")) {
				ipcRenderer.send("hide");
			}
		});
	});
}

async function removeUnlistedFiles(
	fileArray: launcherFile[],
	directoryPath: string,
	ignoreList: string[]
): Promise<void> {
	let p = new Promise<void>((resolve, reject) => {
		fs.readdirSync(directoryPath).forEach((file) => {
			const filePath = path.join(directoryPath, file);
			// Check if file should be removed
			const key = filePath.replace(appData, "");
			const found = fileArray.some((f) => f.Key === key);
			let ignored = false;
			// Check if file should be ignored
			ignoreList.forEach((ignore) => {
				if (key.startsWith(ignore)) {
					ignored = true;
				}
			});

			if (!found && !ignored) {
				const stats = fs.statSync(filePath);
				if (stats.isDirectory()) {
					removeUnlistedFiles(fileArray, filePath, ignoreList);
				} else {
					fs.unlinkSync(filePath);
				}
			} else {
				// File should be kept, continue recursively
				if (fs.statSync(filePath).isDirectory()) {
					removeUnlistedFiles(fileArray, filePath, ignoreList);
				}
			}
		});
		resolve();
	});
	return p;
}



function updateFiles(
	fileArray: launcherFile[],
	downloadServer: DownloadServer
) {
	let p = new Promise<void>(async (resolve, reject) => {
		const filesToUpdate: launcherFile[] = [];
		for (let i = 0; i < fileArray.length; i++) {
			const file = fileArray[i];
			const filePath = path.join(appData + file.Key);
			if (fs.existsSync(filePath)) {
				const fileSize = fs.statSync(filePath).size;
				const fileMd5 = md5File.sync(filePath);
				if (fileSize != Number(file.Size) || file.ETag != fileMd5) {
					filesToUpdate.push(file);
				}
			} else {
				filesToUpdate.push(file);
			}
		}
		for (let i = 0; i < filesToUpdate.length; i++) {
			const file = filesToUpdate[i];
			totalBytes += Number(file.Size);
		}
		for (let i = 0; i < filesToUpdate.length; i++) {
			const file = filesToUpdate[i];
			launcherProgress.setloadProgressText(file.Key);
			await downloadServer.downloadFile(file);
			downloadedBytes += Number(file.Size);
			const dlPercent: Number = (downloadedBytes / totalBytes) * 100;
			launcherProgress.setProgressBar(Number(dlPercent));
		}
		resolve();
	});
	return p;
}

async function removeEmptyDirs(directoryPath: string): Promise<void> {
	let p = new Promise<void>((resolve, reject) => {
		fs.readdir(directoryPath, (err, files) => {
			if (directoryPath == appData) return;
			if (err) reject();
			if (files.length === 0) {
				// Directory is empty, remove it
				fs.rmdir(directoryPath, (err) => {
					if (err) throw err;
				});
			} else {
				// Directory is not empty, loop through files and remove empty subdirectories
				files.forEach((file) => {
					const filePath = `${directoryPath}/${file}`;

					if (fs.statSync(filePath).isDirectory()) {
						removeEmptyDirs(filePath);
					}
				});
			}
		});
		resolve();
	});
	return p;
}
