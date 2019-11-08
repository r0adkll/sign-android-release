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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tc = __importStar(require("@actions/tool-cache"));
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const fs_1 = __importDefault(require("fs"));
const path = __importStar(require("path"));
function downloadAndroidTools(toolsVersion = "4333796", buildToolsVersion = '29.0.2') {
    return __awaiter(this, void 0, void 0, function* () {
        const buildToolDir = tc.find('build-tools', buildToolsVersion);
        if (buildToolDir.length === 0) {
            const androidToolPath = yield tc.downloadTool(`https://dl.google.com/android/repository/sdk-tools-linux-${toolsVersion}.zip`);
            const androidToolExtractedFolder = yield tc.extractZip(androidToolPath, 'android-sdk');
            const cachedPath = yield tc.cacheDir(androidToolExtractedFolder, 'android-sdk', toolsVersion);
            core.addPath(cachedPath);
            core.addPath(path.join(cachedPath, 'bin'));
            // Install the platform tools
            exec.exec('yes | sdkmanager --licenses');
            exec.exec('yes | sdkmanager', [
                `\"build-tools;${buildToolsVersion}\"`
            ]);
            // Add our new build tools to the exec path
            const cachedBuildTools = yield tc.cacheDir(path.join(cachedPath, `build-tools/${buildToolsVersion}`), "build-tools", buildToolsVersion);
            core.addPath(cachedBuildTools);
        }
        else {
            core.addPath(buildToolDir);
        }
    });
}
exports.downloadAndroidTools = downloadAndroidTools;
function findReleaseFile(releaseDir) {
    const releaseFiles = fs_1.default.readdirSync(releaseDir, { withFileTypes: true })
        .filter(item => !item.isDirectory())
        .filter(item => item.name.endsWith(".apk") || item.name.endsWith(".aab"));
    if (releaseFiles.length > 0) {
        return releaseFiles[0];
    }
}
exports.findReleaseFile = findReleaseFile;
