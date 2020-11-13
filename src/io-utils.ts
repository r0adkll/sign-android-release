import {Dirent} from "fs";
import fs from "fs";

export function getReleaseFile(files: Dirent[]): Dirent | undefined {
    if (files.length > 0) {
        return files[0]
    }
}

export function findReleaseFile(releaseDir: string): Dirent | undefined {
    const releaseFiles = fs.readdirSync(releaseDir, {withFileTypes: true})
        .filter(item => !item.isDirectory())
        .filter(item => item.name.endsWith(".apk") || item.name.endsWith(".aab"));

    return getReleaseFile(releaseFiles)
}

