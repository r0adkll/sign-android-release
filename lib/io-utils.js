"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require('path');
const fs = require('fs');
function findReleaseFile(releaseDir) {
    const releaseFiles = fs.readdirSync(releaseDir, { withFileTypes: true })
        .filter(item => !item.isDirectory())
        .filter(item => item.name.endsWith(".apk") || item.name.endsWith(".aab"));
    if (releaseFiles.length > 0) {
        return releaseFiles[0];
    }
}
exports.findReleaseFile = findReleaseFile;
