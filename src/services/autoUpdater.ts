import { autoUpdater, UpdateCheckResult } from "electron-updater";
import * as logger from "electron-log";

export async function checkForUpdates(): Promise<void> {
	return new Promise(async (resolve, reject) => {
		logger.log("Checking for updates...");
		let updatecheckresult = await autoUpdater.checkForUpdates();
		if (updatecheckresult != null) {
			logger.log("Update found!");
			autoUpdater.downloadUpdate();
			autoUpdater.on("update-downloaded", (info) => {
				logger.log("Update downloaded!");
				setTimeout(() => {
					autoUpdater.quitAndInstall();
				}, 1000);
			});
			autoUpdater.on("download-progress", (progressObj) => {
				let log_message =
					"Download speed: " + progressObj.bytesPerSecond;
				log_message =
					log_message + " - Downloaded " + progressObj.percent + "%";
				log_message =
					log_message +
					" (" +
					progressObj.transferred +
					"/" +
					progressObj.total +
					")";
				console.log(log_message);
				document.getElementById("updateText")!.innerHTML =
					"Mise à jour: " + progressObj.percent + "%";
			});
		} else {
			logger.log("No updates found.");
			resolve();
		}
	});
}
