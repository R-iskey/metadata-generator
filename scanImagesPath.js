const fs = require('fs/promises');
const {statSync} = require('fs');
const path = require('path');
const {last, flatten} = require('lodash');

async function scanImagesPath(directoryPath, ext = []) {
    const filesInDirectory = await fs.readdir(directoryPath);
    const files = await Promise.all(
        filesInDirectory
            // filter system files
            .filter(file => !file.startsWith('.'))
            // filter by file extension
            .filter(file => {
                const filePath = path.join(directoryPath, file);
                const stats = statSync(filePath);
                const fileExt = last(file.toString().split('.'));
                if (ext.length && stats.isFile()) {
                    return ext.includes('.' + fileExt)
                }
                return true;
            })
            .map(async file => {
                const filePath = path.join(directoryPath, file);
                const stats = await fs.stat(filePath);

                if (stats.isDirectory()) {
                    return scanImagesPath(filePath, ext);
                } else {
                    return filePath;
                }
            })
    );
    return flatten(files)
}

module.exports = scanImagesPath;
