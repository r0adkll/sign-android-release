import * as exec from '@actions/exec';
import * as core from '@actions/core';
import * as io from '@actions/io';
import * as path from "path";
import * as fs from "fs";

export async function signApkFile(
    apkFile: string,
    signingKeyFile: string,
    alias: string,
    keyStorePassword: string,
    keyPassword?: string
): Promise<string> {

    core.debug("Zipaligning APK file");

    // Find zipalign executable
    const buildToolsVersion = process.env.BUILD_TOOLS_VERSION || '33.0.0';
    const androidHome = process.env.ANDROID_HOME;
    const buildTools = path.join(androidHome!, `build-tools/${buildToolsVersion}`);
    if (!fs.existsSync(buildTools)) {
        core.error(`Couldnt find the Android build tools @ ${buildTools}`)
    }

    const zipAlign = path.join(buildTools, 'zipalign');
    core.debug(`Found 'zipalign' @ ${zipAlign}`);

    // Align the apk file
    const alignedApkFile = apkFile.replace('.apk', '-aligned.apk');
    await exec.exec(`"${zipAlign}"`, [
        '-c',
        '-v', '4',
        apkFile
    ]);
    
    await exec.exec(`"cp"`, [
        apkFile,
        alignedApkFile
    ]);

    core.debug("Signing APK file");

    // find apksigner path
    const apkSigner = path.join(buildTools, 'apksigner');
    core.debug(`Found 'apksigner' @ ${apkSigner}`);

    // apksigner sign --ks my-release-key.jks --out my-app-release.apk my-app-unsigned-aligned.apk
    const signedApkFile = apkFile.replace('.apk', '-signed.apk');
    const args = [
        'sign',
        '--ks', signingKeyFile,
        '--ks-key-alias', alias,
        '--ks-pass', `pass:${keyStorePassword}`,
        '--out', signedApkFile
    ];

    if (keyPassword) {
        args.push('--key-pass', `pass:${keyPassword}`);
    }
    args.push(alignedApkFile);

    await exec.exec(`"${apkSigner}"`, args);

    // Verify
    core.debug("Verifying Signed APK");
    await exec.exec(`"${apkSigner}"`, [
        'verify',
        signedApkFile
    ]);

    return signedApkFile
}

export async function signAabFile(
    aabFile: string,
    signingKeyFile: string,
    alias: string,
    keyStorePassword: string,
    keyPassword?: string,
): Promise<string> {
    core.debug("Signing AAB file");
    const jarSignerPath = await io.which('jarsigner', true);
    core.debug(`Found 'jarsigner' @ ${jarSignerPath}`);
    const args = [
        '-keystore', signingKeyFile,
        '-storepass', keyStorePassword,
    ];

    if (keyPassword) {
        args.push('-keypass', keyPassword);
    }

    args.push(aabFile, alias);

    await exec.exec(`"${jarSignerPath}"`, args);

    return aabFile
}
