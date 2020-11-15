import * as core from '@actions/core';
import {signAabFile, signApkFile} from "./signing";
import path from "path";
import fs from "fs";
import * as io from "./io-utils";

async function run() {
  try {
    if (process.env.DEBUG_ACTION === 'true') {
      core.debug("DEBUG FLAG DETECTED, SHORTCUTTING ACTION.")
      return;
    }

    const releaseDir = core.getInput('releaseDirectory');
    const signingKeyBase64 = core.getInput('signingKeyBase64');
    const alias = core.getInput('alias');
    const keyStorePassword = core.getInput('keyStorePassword');
    const keyPassword = core.getInput('keyPassword');

    console.log(`Preparing to sign key @ ${releaseDir} with signing key`);

    // 1. Find release file
    const releaseFile = io.findReleaseFile(releaseDir);
    if (releaseFile !== undefined) {
      core.debug(`Found release to sign: ${releaseFile.name}`);

      // 3. Now that we have a release file, decode and save the signing key
      const signingKey = path.join(releaseDir, 'signingKey.jks');
      fs.writeFileSync(signingKey, signingKeyBase64, 'base64');

      // 4. Now zipalign the release file
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

      console.log('Release signed!');
      core.debug('Release signed! Setting outputs');

      core.exportVariable("SIGNED_RELEASE_FILE", signedReleaseFile);
      core.setOutput('signedReleaseFile', signedReleaseFile);
    } else {
      core.error("No release file (.apk or .aab) could be found. Abort.");
      core.setFailed('No release file (.apk or .aab) could be found.');
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
