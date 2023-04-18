import { launcherFile } from "./launcherfile";
import { ElementCompact, xml2js } from "xml-js";
import https from "http";
import * as logger from "electron-log";
import * as fs from "fs";
import * as path from "path";
import download from "download";
import { downloadedBytes, totalBytes } from "../services/updater";
import * as launcherProgress from "../web/mainWindow/preload";

const logPrefix = "[DownloadServer]";

export class DownloadServer {
	constructor(
		public ignoredListUrl: string = "http://coloredcity.fr/api/ignore.cfg",
		public deleteListUrl: string = "http://coloredcity.fr/api/delete.cfg",
		public contentIndexUrl: string = "http://coloredcity.fr/api/files/"
	) {}

	async getFileList(): Promise<launcherFile[]> {
		logger.log(logPrefix + " Récupération de la liste des fichiers...");
		let toReturn: launcherFile[] = [];
		console.log(this.contentIndexUrl);
		let data = await require("axios").get(this.contentIndexUrl);
		const jsObject = xml2js(data.data, {
			compact: true,
		}) as ElementCompact;
		for (
			let i = 0;
			i < jsObject.xml.ListBucketResult.Contents.length;
			i++
		) {
			const file = jsObject.xml.ListBucketResult.Contents[i];
			const fileKey = file.Key._text;
			const fileETag = file.ETag._text;
			const fileSize = file.Size._text;
			const fileObject = new launcherFile(fileKey, fileSize, fileETag);
			toReturn.push(fileObject);
		}
		return toReturn;
	}

	async getIgnoreList(): Promise<string[]> {
		console.log(
			logPrefix + " Récupération de la liste des fichiers ignorés..."
		);
		const ignoreListdata = await require("axios").get(this.ignoredListUrl);
		let ignoreList = ignoreListdata.data.split("\n");
		ignoreList.forEach((element: string) => {
			element.replace("\n", "").replace("/", "\\").replace("\r", "");
		});
		return ignoreList;
	}

	async getDeleteList(): Promise<string[]> {
		console.log(
			logPrefix + " Récupération de la liste des fichiers à supprimer..."
		);
		const deleteListdata = await require("axios").get(this.deleteListUrl);
		let deleteList = deleteListdata.data.split("\n");
		deleteList.forEach((element: string) => {
			element.replace("\n", "").replace("/", "\\").replace("\r", "");
		});
		return deleteList;
	}

	async downloadFile(targetFile: launcherFile): Promise<void> {
		const downloadUrl = (this.contentIndexUrl + targetFile.Key).replace(
			/\\/g,
			"/"
		);
		const targetFileDir = path.join(targetFile.appData, targetFile.Key);
		return new Promise(async (resolve, reject) => {
			const targetFileDirSplit = targetFileDir.split("\\");
			targetFileDirSplit.pop();
			const targetFileDirDir = targetFileDirSplit.join("\\");
			if (!fs.existsSync(targetFileDirDir)) {
				fs.mkdirSync(targetFileDirDir, { recursive: true });
			}

			await download(downloadUrl)
				.on("downloadProgress", (progress: { percent: string }) => {
					launcherProgress.setProgressBar(
						((parseFloat(progress.percent) *
							Number(targetFile.Size) +
							downloadedBytes) /
							totalBytes) *
							100
					);
				})
				.pipe(fs.createWriteStream(targetFileDir))
				.on("finish", () => {
					resolve();
				});
		});
	}

	downloadFileFetch(): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			fetch(this.deleteListUrl)
				.then((response) => {
					return resolve(response.json.toString());
				})
				.catch((error) => {});
		});
	}
}
