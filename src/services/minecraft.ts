import { LaunchOption, MinecraftLocation, launch } from "@xmcl/core";
import { offline, Authentication, GameProfile } from "@xmcl/user";
import { userInfo } from "os";
import path from "path";
import * as logger from "electron-log";

import { updateClient } from "./updater";
import { ipcRenderer } from "electron";

const appData = path.join(userInfo().homedir + "\\AppData\\Roaming\\.ColoredV2");


export async function launchMinecraft(username: string) {
    updateClient(appData).then(() => {
        throw new Error("Not implemented");
    }).catch((err) => {
        logger.error(err);
    });
}