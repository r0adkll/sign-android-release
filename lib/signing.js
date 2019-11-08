"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const exec = __importStar(require("@actions/exec"));
const core = __importStar(require("@actions/core"));
const io = __importStar(require("@actions/io"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
function signApkFile(apkFile, signingKeyFile, alias, keyStorePassword, keyPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        core.debug("Zipaligning APK file");
        // Find zipalign executable
        const buildToolsVersion = process.env.BUILD_TOOLS_VERSION || '29.0.2';
        const androidHome = process.env.ANDROID_HOME;
        const buildTools = path.join(androidHome, `build-tools/${buildToolsVersion}`);
        if (!fs.existsSync(buildTools)) {
            core.error(`Couldnt find the Android build tools @ ${buildTools}`);
        }
        const zipAlign = path.join(buildTools, 'zipalign');
        core.debug(`Found 'zipalign' @ ${zipAlign}`);
        // Align the apk file
        const alignedApkFile = apkFile.replace('.apk', '-aligned.apk');
        yield exec.exec(`"${zipAlign}"`, [
            '-v', '-p', '4',
            apkFile,
            alignedApkFile
        ]);
        core.debug("Signing APK file");
        // find apksigner path
        const apkSigner = path.join(buildTools, 'apksigner');
        core.debug(`Found 'apksigner' @ ${apkSigner}`);
        // apksigner sign --ks my-release-key.jks --out my-app-release.apk my-app-unsigned-aligned.apk
        const signedApkFile = apkFile.replace('.apk', '-signed.apk');
        yield exec.exec(`"${apkSigner}"`, [
            'sign',
            '--ks', signingKeyFile,
            '--out', signedApkFile,
            alignedApkFile
        ]);
        // Verify
        core.debug("Verifying Signed APK");
        yield exec.exec(`"${apkSigner}"`, [
            'verify',
            signedApkFile
        ]);
        return signedApkFile;
    });
}
exports.signApkFile = signApkFile;
function signAabFile(aabFile, signingKeyFile, alias, keyStorePassword, keyPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        core.debug("Signing AAB file");
        const jarSignerPath = yield io.which('jarsigner', true);
        core.debug(`Found 'jarsigner' @ ${jarSignerPath}`);
        yield exec.exec(`"${jarSignerPath}"`, [
            '-keystore', signingKeyFile,
            '-storepass', keyStorePassword,
            '-keypass', keyPassword,
            aabFile,
            alias
        ]);
        return aabFile;
    });
}
exports.signAabFile = signAabFile;
