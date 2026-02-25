#!/usr/bin/env node

/**
 * CircuitJS Build Script
 *
 * This script builds CircuitJS from source (if Java/Gradle available) or
 * downloads pre-built assets from the official site.
 *
 * The compiled assets are copied to dist/circuitjs/ for bundling with the plugin.
 */

import { execSync, spawn } from 'child_process';
import { existsSync, mkdirSync, cpSync, rmSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import { createWriteStream } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');
const VENDOR_DIR = join(ROOT_DIR, 'vendor', 'circuitjs1');
const DIST_DIR = join(ROOT_DIR, 'dist', 'circuitjs');
const WAR_DIR = join(VENDOR_DIR, 'war');

// Files needed for the plugin (from CircuitJS war directory)
const REQUIRED_FILES = [
    'circuitjs.html',
    'lz-string.min.js',
];

const REQUIRED_DIRS = [
    'circuitjs1', // Compiled GWT output
];

/**
 * Check if a command exists on the system
 */
function commandExists(cmd) {
    try {
        if (process.platform === 'win32') {
            execSync(`where ${cmd}`, { stdio: 'ignore' });
        } else {
            execSync(`which ${cmd}`, { stdio: 'ignore' });
        }
        return true;
    } catch {
        return false;
    }
}

/**
 * Check if Java is available
 */
function hasJava() {
    if (!commandExists('java')) {
        return false;
    }
    try {
        const version = execSync('java -version 2>&1', { encoding: 'utf-8' });
        console.log('✓ Java found:', version.split('\n')[0]);
        return true;
    } catch {
        return false;
    }
}

/**
 * Check if Gradle wrapper exists in submodule
 */
function hasGradleWrapper() {
    const gradlew = process.platform === 'win32' ? 'gradlew.bat' : 'gradlew';
    return existsSync(join(VENDOR_DIR, gradlew));
}

/**
 * Check if system Gradle is available
 */
function hasSystemGradle() {
    return commandExists('gradle');
}

/**
 * Build CircuitJS using Gradle
 */
async function buildWithGradle(gradleCmd) {
    console.log('\n📦 Building CircuitJS with Gradle...');

    const cmd = gradleCmd ?? (process.platform === 'win32' ? 'gradlew.bat' : './gradlew');

    return new Promise((resolve, reject) => {
        console.log('  Running: gradle compileGwt...');
        const compile = spawn(cmd, ['compileGwt', '--console', 'plain'], {
            cwd: VENDOR_DIR,
            shell: true,
            stdio: 'inherit'
        });

        compile.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Gradle compileGwt failed with code ${code}`));
                return;
            }

            console.log('  Running: gradle makeSite...');
            const makeSite = spawn(cmd, ['makeSite', '--console', 'plain'], {
                cwd: VENDOR_DIR,
                shell: true,
                stdio: 'inherit'
            });

            makeSite.on('close', (siteCode) => {
                if (siteCode !== 0) {
                    reject(new Error(`Gradle makeSite failed with code ${siteCode}`));
                    return;
                }
                resolve();
            });
        });
    });
}

/**
 * Download a file from URL
 */
function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        const file = createWriteStream(destPath);
        https.get(url, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                // Follow redirect
                downloadFile(response.headers.location, destPath)
                    .then(resolve)
                    .catch(reject);
                return;
            }

            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download: ${response.statusCode}`));
                return;
            }

            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            rmSync(destPath, { force: true });
            reject(err);
        });
    });
}

/**
 * Copy pre-built assets from war directory to dist
 */
function copyAssets(sourceDir) {
    console.log(`\n📁 Copying assets from ${sourceDir} to ${DIST_DIR}...`);

    // Clean and create dist directory
    if (existsSync(DIST_DIR)) {
        rmSync(DIST_DIR, { recursive: true });
    }
    mkdirSync(DIST_DIR, { recursive: true });

    // Copy required files
    for (const file of REQUIRED_FILES) {
        const src = join(sourceDir, file);
        const dest = join(DIST_DIR, file);
        if (existsSync(src)) {
            cpSync(src, dest);
            console.log(`  ✓ Copied ${file}`);
        } else {
            console.warn(`  ⚠ Warning: ${file} not found`);
        }
    }

    // Copy required directories
    for (const dir of REQUIRED_DIRS) {
        const src = join(sourceDir, dir);
        const dest = join(DIST_DIR, dir);
        if (existsSync(src)) {
            cpSync(src, dest, { recursive: true });
            const fileCount = countFiles(dest);
            console.log(`  ✓ Copied ${dir}/ (${fileCount} files)`);
        } else {
            console.warn(`  ⚠ Warning: ${dir}/ not found`);
        }
    }
}

/**
 * Count files in a directory recursively
 */
function countFiles(dir) {
    let count = 0;
    const items = readdirSync(dir);
    for (const item of items) {
        const fullPath = join(dir, item);
        if (statSync(fullPath).isDirectory()) {
            count += countFiles(fullPath);
        } else {
            count++;
        }
    }
    return count;
}

/**
 * Calculate total size of dist directory
 */
function getDirSize(dir) {
    let size = 0;
    const items = readdirSync(dir);
    for (const item of items) {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
            size += getDirSize(fullPath);
        } else {
            size += stat.size;
        }
    }
    return size;
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Main build function
 */
async function main() {
    console.log('🔧 CircuitJS Build Script');
    console.log('='.repeat(50));

    // Check if submodule is initialized
    if (!existsSync(VENDOR_DIR) || !existsSync(join(VENDOR_DIR, 'build.gradle'))) {
        console.error('\n❌ CircuitJS submodule not found!');
        console.error('   Run: git submodule update --init --recursive');
        process.exit(1);
    }

    // Check if pre-built war directory has compiled assets
    const preBuiltDir = join(WAR_DIR, 'circuitjs1');
    const hasPreBuilt = existsSync(preBuiltDir) && readdirSync(preBuiltDir).length > 0;

    if (hasPreBuilt) {
        console.log('\n✓ Found pre-built CircuitJS assets in war/');
        copyAssets(WAR_DIR);
    } else if (hasJava() && (hasGradleWrapper() || hasSystemGradle())) {
        const gradleCmd = hasGradleWrapper()
            ? (process.platform === 'win32' ? 'gradlew.bat' : './gradlew')
            : 'gradle';
        console.log(`\n✓ Java and Gradle available (${gradleCmd}) - building from source...`);
        try {
            await buildWithGradle(gradleCmd);

            // After build, assets should be in site/ or war/
            const siteDir = join(VENDOR_DIR, 'site');
            if (existsSync(siteDir)) {
                copyAssets(siteDir);
            } else {
                copyAssets(WAR_DIR);
            }
        } catch (error) {
            console.error('\n❌ Build failed:', error.message);
            console.error('   You may need to download pre-built assets manually.');
            process.exit(1);
        }
    } else {
        console.error('\n❌ Cannot build CircuitJS:');
        console.error('   - No pre-built assets found in vendor/circuitjs1/war/circuitjs1/');
        console.error('   - Java/Gradle not available for building from source');
        console.error('\nOptions:');
        console.error('   1. Install Java JDK 8+ and try again');
        console.error('   2. Download pre-built assets from https://falstad.com/circuit/');
        console.error('      and place them in vendor/circuitjs1/war/');
        process.exit(1);
    }

    // Verify build
    const circuitjsHtml = join(DIST_DIR, 'circuitjs.html');
    const circuitjs1Dir = join(DIST_DIR, 'circuitjs1');

    if (existsSync(circuitjsHtml) && existsSync(circuitjs1Dir)) {
        const totalSize = getDirSize(DIST_DIR);
        console.log('\n✅ Build complete!');
        console.log(`   Output: ${DIST_DIR}`);
        console.log(`   Size: ${formatBytes(totalSize)}`);
    } else {
        console.error('\n❌ Build verification failed - required files missing');
        process.exit(1);
    }
}

// Run
main().catch((error) => {
    console.error('Build error:', error);
    process.exit(1);
});
