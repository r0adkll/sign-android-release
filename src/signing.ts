import * as exec from '@actions/exec';
import * as core from '@actions/core';
import * as io from '@actions/io';

export async function signApkFile(
    apkFile: string,
    signingKeyFile: string,
    alias: string,
    keyStorePassword: string,
    keyPassword: string
): Promise<string> {

    core.debug("Zipaligning APK file");

    // Find zipalign executable
    const zipAlignPath = await io.which('zipalign', true);
    core.debug(`Found 'zipalign' @ ${zipAlignPath}`);

    // Align the apk file
    const alignedApkFile = apkFile.replace('.apk', '-aligned.apk');
    await exec.exec(`"${zipAlignPath}"`, [
        '-v', '-p 4',
        apkFile,
        alignedApkFile
    ]);

    core.debug("Signing APK file");

    // find apksigner path
    const apkSignerPath = await io.which('apksigner', true);
    core.debug(`Found 'apksigner' @ ${apkSignerPath}`);

    // apksigner sign --ks my-release-key.jks --out my-app-release.apk my-app-unsigned-aligned.apk
    const signedApkFile = apkFile.replace('.apk', '-signed.apk');
    await exec.exec(`"${apkSignerPath}"`, [
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
    const jarSignerPath = await io.which('jarsigner', true);
    core.debug(`Found 'jarsigner' @ ${jarSignerPath}`);

    await exec.exec(`"${jarSignerPath}"`, [
        '-keystore', signingKeyFile,
        '-storepass', keyStorePassword,
        '-keypass', keyPassword,
        aabFile,
        alias
    ]);

    return aabFile
}