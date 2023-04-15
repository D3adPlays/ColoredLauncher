const isdev = process.env.NODE_ENV === 'development';
import chokidar from 'chokidar';
import path from 'path';
import * as logger from 'electron-log';
if (isdev) {
    chokidar.watch(path.join(__dirname, "../..")).on('all', (event, path) => {
        if (event === 'change') {
            window.location.reload();
            logger.info("Page rechargée");
        }
    });
}