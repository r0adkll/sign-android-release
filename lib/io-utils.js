"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findReleaseFile = exports.getReleaseFile = void 0;
const fs_1 = __importDefault(require("fs"));
function getReleaseFile(files) {
    if (files.length > 0) {
        return files[0];
    }
}
exports.getReleaseFile = getReleaseFile;
function findReleaseFile(releaseDir) {
    const releaseFiles = fs_1.default.readdirSync(releaseDir, { withFileTypes: true })
        .filter(item => !item.isDirectory())
        .filter(item => item.name.endsWith(".apk") || item.name.endsWith(".aab"));
    return getReleaseFile(releaseFiles);
}
exports.findReleaseFile = findReleaseFile;
