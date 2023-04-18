import { userInfo } from "os";
import path from "path";
import * as logger from "electron-log";

import { updateClient } from "./updater";

const appData = path.join(userInfo().homedir + "\\AppData\\Roaming\\.ColoredV2");

export async function launchMinecraft(username: string) {
    updateClient().then(() => {
        throw new Error("Not implemented");
    }).catch((err) => {
        logger.error(err);
    });
}