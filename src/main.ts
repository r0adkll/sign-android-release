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

    console.log(`Preparing to sign file(s) @ ${releaseDir} with signing key`);

    // 1. Find release files
    const releaseFiles = io.findReleaseFiles(releaseDir);
    if (releaseFiles !== undefined && releaseFiles.length !== 0) {
      // 3. Now that we have a release files, decode and save the signing key
      const signingKey = path.join(releaseDir, 'signingKey.jks');
      fs.writeFileSync(signingKey, signingKeyBase64, 'base64');

      // 4. Now zipalign and sign each one of the the release files
      let signedReleaseFiles:string[] = [];
      let index = 0;
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

        // Each signed release file is stored in a separate variable + output.
        core.exportVariable(`SIGNED_RELEASE_FILE_${index}`, signedReleaseFile);
        core.setOutput(`signedReleaseFile${index}`, signedReleaseFile);
        signedReleaseFiles.push(signedReleaseFile);
        ++index;
      }

      // All signed release files are stored in a merged variable + output.
      core.exportVariable(`SIGNED_RELEASE_FILES`, signedReleaseFiles.join(":"));
      core.setOutput('signedReleaseFiles', signedReleaseFiles.join(":"));
      core.exportVariable(`NOF_SIGNED_RELEASE_FILES`, `${signedReleaseFiles.length}`);
      core.setOutput(`nofSignedReleaseFiles`, `${signedReleaseFiles.length}`);

      // When there is one and only one signed release file, store it in a specific variable + output.
      if (signedReleaseFiles.length == 1) {
        core.exportVariable(`SIGNED_RELEASE_FILE`, signedReleaseFiles[0]);
        core.setOutput('signedReleaseFile', signedReleaseFiles[0]);
      }
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
