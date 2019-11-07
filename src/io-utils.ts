import {Dirent} from "fs";

const path = require('path');
const fs = require('fs');

export function findReleaseFile(releaseDir: string): Dirent | undefined {
    const releaseFiles = fs.readdirSync(releaseDir, {withFileTypes: true})
        .filter(item => !item.isDirectory())
        .filter(item => item.name.endsWith(".apk") || item.name.endsWith(".aab"));

    if (releaseFiles.length > 0) {
        return releaseFiles[0]
    }
}