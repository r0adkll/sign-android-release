import * as tc from '@actions/tool-cache'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import {Dirent} from "fs";
import fs from "fs";
import * as path from "path";

export async function downloadAndroidTools(toolsVersion: string = "4333796", buildToolsVersion: string = '29.0.2') {
    const buildToolDir = tc.find('build-tools', buildToolsVersion);
    if (buildToolDir.length == 0) {
        const androidToolPath = await tc.downloadTool(`https://dl.google.com/android/repository/sdk-tools-linux-${toolsVersion}.zip`);
        const androidToolExtractedFolder = await tc.extractZip(androidToolPath, 'android-sdk');
        const cachedPath = await tc.cacheDir(androidToolExtractedFolder, 'android-sdk', toolsVersion);

        core.addPath(cachedPath);
        core.addPath(path.join(cachedPath, 'bin'));

        // Install the platform tools
        exec.exec('yes | sdkmanager --licenses');
        exec.exec('yes | sdkmanager', [
            `\"build-tools;${buildToolsVersion}\"`
        ]);

        // Add our new build tools to the exec path
        const cachedBuildTools = await tc.cacheDir(path.join(cachedPath, `build-tools/${buildToolsVersion}`), "build-tools", buildToolsVersion);
        core.addPath(cachedBuildTools)
    } else {
        core.addPath(buildToolDir)
    }
}

export function findReleaseFile(releaseDir: string): Dirent | undefined {
    const releaseFiles = fs.readdirSync(releaseDir, {withFileTypes: true})
        .filter(item => !item.isDirectory())
        .filter(item => item.name.endsWith(".apk") || item.name.endsWith(".aab"));

    if (releaseFiles.length > 0) {
        return releaseFiles[0]
    }
}

