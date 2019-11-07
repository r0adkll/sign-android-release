import * as exec from '@actions/exec';
import * as core from '@actions/core';

export async function signApkFile(
    apkFile: string,
    signingKeyFile: string,
    alias: string,
    keyStorePassword: string,
    keyPassword: string
): Promise<string> {

    core.debug("Zipaligning APK file");

    // Align the apk file
    const alignedApkFile = apkFile.replace('.apk', '-aligned.apk');
    await exec.exec('zipalign', [
        '-v', '-p 4',
        apkFile,
        alignedApkFile
    ]);

    core.debug("Signing APK file");

    // apksigner sign --ks my-release-key.jks --out my-app-release.apk my-app-unsigned-aligned.apk
    const signedApkFile = apkFile.replace('.apk', '-signed.apk');
    await exec.exec('apksigner', [
        'sign',
        '--ks', signingKeyFile,
        '--out', signedApkFile,
        alignedApkFile
    ]);

    return signedApkFile
}

export async function signAabFile(
    aabFile: string,
    signingKeyFile: string,
    alias: string,
    keyStorePassword: string,
    keyPassword: string
): Promise<string> {
    core.debug("Signing AAB file");
    await exec.exec(`jarsigner`, [
        '-keystore', signingKeyFile,
        '-storepass', keyStorePassword,
        '-keypass', keyPassword,
        aabFile,
        alias
    ]);

    return aabFile
}