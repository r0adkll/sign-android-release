import * as core from '@actions/core';
import {signAabFile, signApkFile} from "./signing";
import path from "path";
import fs from "fs";
import * as io from "./io-utils";

async function run() {
  try {
    const releaseDir = core.getInput('releaseDirectory');
    const signingKeyBase64 = core.getInput('signingKeyBase64');
    const alias = core.getInput('alias');
    const keyStorePassword = core.getInput('keyStorePassword');
    const keyPassword = core.getInput('keyPassword');

    console.log(`Preparing to sign key @ ${releaseDir} with signing key`);

    // 1. Find release files
    const releaseFiles = io.findReleaseFile(releaseDir);
    if (releaseFiles !== undefined && releaseFiles.length !== 0) {
      // 3. Now that we have a release files, decode and save the signing key
      const signingKey = path.join(releaseDir, 'signingKey.jks');
      fs.writeFileSync(signingKey, signingKeyBase64, 'base64');

      // 4. Now zipalign and sign each one of the the release files
      let signedReleaseFiles = Array()
      for (let releaseFile of releaseFiles) {
        core.debug(`Found release to sign: ${releaseFile.name}`);
        const releaseFilePath = path.join(releaseDir, releaseFile.name);
        let signedReleaseFile = '';
        if (releaseFile.name.endsWith('.apk')) {
          signedReleaseFile = await signApkFile(releaseFilePath, signingKey, alias, keyStorePassword, keyPassword);
        } else if (releaseFile.name.endsWith('.aab')) {
          signedReleaseFile = await signAabFile(releaseFilePath, signingKey, alias, keyStorePassword, keyPassword);
        } else {
          core.error('No valid release file to sign, abort.');
          core.setFailed('No valid release file to sign.');
        }

        core.debug('Release signed! Setting outputs.');
        signedReleaseFiles.push(signedReleaseFile);
      }
      core.exportVariable('SIGNED_RELEASE_FILE', signedReleaseFiles.join(", "));
      core.setOutput('signedReleaseFile', signedReleaseFiles.join(", "));
      console.log('Releases signed!');
    } else {
      core.error("No release files (.apk or .aab) could be found. Abort.");
      core.setFailed('No release files (.apk or .aab) could be found.');
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
