#!/usr/bin/env node

/**
 * Version Update Script for Pop! Bubbles
 * Usage: node update-version.js [patch|minor|major]
 */

const fs = require('fs');
const path = require('path');

const VERSION_FILE = path.join(__dirname, 'version.json');
const HTML_FILE = path.join(__dirname, 'docs', 'index.html');

function readVersion() {
    try {
        const data = fs.readFileSync(VERSION_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading version file:', error.message);
        process.exit(1);
    }
}

function writeVersion(versionData) {
    try {
        fs.writeFileSync(VERSION_FILE, JSON.stringify(versionData, null, 2));
        console.log('✅ Version file updated successfully');
    } catch (error) {
        console.error('Error writing version file:', error.message);
        process.exit(1);
    }
}

function updateHTMLVersion(version) {
    try {
        let htmlContent = fs.readFileSync(HTML_FILE, 'utf8');
        
        // Update version in HTML
        htmlContent = htmlContent.replace(
            /<span id="versionNumber">[\d.]+<\/span>/,
            `<span id="versionNumber">${version}</span>`
        );
        
        fs.writeFileSync(HTML_FILE, htmlContent);
        console.log('✅ HTML file updated with new version');
    } catch (error) {
        console.error('Error updating HTML file:', error.message);
        process.exit(1);
    }
}

function incrementVersion(currentVersion, type) {
    const parts = currentVersion.split('.').map(Number);
    
    switch (type) {
        case 'major':
            parts[0]++;
            parts[1] = 0;
            parts[2] = 0;
            break;
        case 'minor':
            parts[1]++;
            parts[2] = 0;
            break;
        case 'patch':
        default:
            parts[2]++;
            break;
    }
    
    return parts.join('.');
}

function main() {
    const versionType = process.argv[2] || 'patch';
    
    if (!['patch', 'minor', 'major'].includes(versionType)) {
        console.error('❌ Invalid version type. Use: patch, minor, or major');
        process.exit(1);
    }
    
    console.log(`🔄 Updating ${versionType} version...`);
    
    const versionData = readVersion();
    const currentVersion = versionData.version;
    const newVersion = incrementVersion(currentVersion, versionType);
    
    // Update version data
    versionData.version = newVersion;
    versionData.build = (versionData.build || 1) + 1;
    versionData.lastUpdate = new Date().toISOString().split('T')[0];
    
    // Add to changelog
    versionData.changelog.unshift({
        version: newVersion,
        date: versionData.lastUpdate,
        changes: [`${versionType} version update`]
    });
    
    // Keep only last 10 changelog entries
    versionData.changelog = versionData.changelog.slice(0, 10);
    
    writeVersion(versionData);
    updateHTMLVersion(newVersion);
    
    console.log(`🎉 Version updated from ${currentVersion} to ${newVersion}`);
    console.log(`📦 Build number: ${versionData.build}`);
    console.log(`📅 Date: ${versionData.lastUpdate}`);
}

if (require.main === module) {
    main();
}

module.exports = { incrementVersion, readVersion, writeVersion };
