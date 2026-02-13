import { App, Notice, Platform, FileSystemAdapter, requestUrl } from "obsidian";
import { CircuitJsSettings } from "./settings";

/**
 * GitHub repository information for downloading assets
 */
const GITHUB_REPO = "StevenGann/obsidian-circuitjs";
const ASSET_FILENAME = "circuitjs-assets.zip";

/**
 * Manages CircuitJS assets - checking, downloading, and extracting
 */
export class AssetManager {
	private app: App;
	private settings: CircuitJsSettings;
	private pluginDir: string;
	private assetsDir: string;
	private assetsReady: boolean = false;

	constructor(app: App, settings: CircuitJsSettings) {
		this.app = app;
		this.settings = settings;

		// Get plugin directory path
		const adapter = this.app.vault.adapter;
		if (adapter instanceof FileSystemAdapter) {
			const basePath = adapter.getBasePath();
			this.pluginDir = `${basePath}/.obsidian/plugins/circuitjs`;
			this.assetsDir = `${this.pluginDir}/circuitjs`;
		} else {
			this.pluginDir = "";
			this.assetsDir = "";
		}
	}

	/**
	 * Check if CircuitJS assets are available
	 */
	async checkAssets(): Promise<boolean> {
		if (!Platform.isDesktopApp || !this.assetsDir) {
			return false;
		}

		try {
			const fs = require("fs");
			const path = require("path");

			const htmlPath = path.join(this.assetsDir, "circuitjs.html");
			const jsDir = path.join(this.assetsDir, "circuitjs1");

			const htmlExists = fs.existsSync(htmlPath);
			const jsDirExists = fs.existsSync(jsDir);

			this.assetsReady = htmlExists && jsDirExists;
			return this.assetsReady;
		} catch (error) {
			console.error("CircuitJS: Error checking assets:", error);
			return false;
		}
	}

	/**
	 * Check if assets are ready (cached result)
	 */
	areAssetsReady(): boolean {
		return this.assetsReady;
	}

	/**
	 * Get the path to the CircuitJS assets directory
	 */
	getAssetsPath(): string {
		return this.assetsDir;
	}

	/**
	 * Download and extract CircuitJS assets from GitHub releases
	 */
	async downloadAssets(onProgress?: (message: string) => void): Promise<boolean> {
		if (!Platform.isDesktopApp) {
			console.log("CircuitJS: Asset download only supported on desktop");
			return false;
		}

		const progress = (msg: string) => {
			console.log(`CircuitJS: ${msg}`);
			onProgress?.(msg);
		};

		try {
			progress("Fetching latest release info...");

			// Get latest release from GitHub API
			const releaseUrl = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
			const releaseResponse = await requestUrl({
				url: releaseUrl,
				headers: {
					"Accept": "application/vnd.github.v3+json",
					"User-Agent": "obsidian-circuitjs"
				}
			});

			if (releaseResponse.status !== 200) {
				throw new Error(`Failed to fetch release info: ${releaseResponse.status}`);
			}

			const releaseData = releaseResponse.json;

			// Find the circuitjs-assets.zip in release assets
			const assetInfo = releaseData.assets?.find(
				(a: { name: string }) => a.name === ASSET_FILENAME
			);

			if (!assetInfo) {
				throw new Error(`${ASSET_FILENAME} not found in latest release`);
			}

			progress(`Downloading ${ASSET_FILENAME}...`);

			// Download the zip file
			const downloadResponse = await requestUrl({
				url: assetInfo.browser_download_url,
				headers: {
					"User-Agent": "obsidian-circuitjs"
				}
			});

			if (downloadResponse.status !== 200) {
				throw new Error(`Failed to download assets: ${downloadResponse.status}`);
			}

			progress("Extracting assets...");

			// Extract the zip file
			await this.extractZip(downloadResponse.arrayBuffer);

			progress("Assets installed successfully!");

			// Verify installation
			this.assetsReady = await this.checkAssets();
			return this.assetsReady;

		} catch (error) {
			console.error("CircuitJS: Error downloading assets:", error);
			progress(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
			return false;
		}
	}

	/**
	 * Extract a zip file to the assets directory
	 */
	private async extractZip(zipData: ArrayBuffer): Promise<void> {
		const fs = require("fs");
		const path = require("path");
		const AdmZip = require("adm-zip");

		// Ensure assets directory exists
		if (!fs.existsSync(this.assetsDir)) {
			fs.mkdirSync(this.assetsDir, { recursive: true });
		}

		// Extract zip
		const zip = new AdmZip(Buffer.from(zipData));
		zip.extractAllTo(this.assetsDir, true);
	}

	/**
	 * Alternative extraction using JSZip (if adm-zip not available)
	 * Falls back to manual extraction
	 */
	private async extractZipManual(zipData: ArrayBuffer): Promise<void> {
		const fs = require("fs");
		const path = require("path");

		// Ensure assets directory exists
		if (!fs.existsSync(this.assetsDir)) {
			fs.mkdirSync(this.assetsDir, { recursive: true });
		}

		// Try using decompress or similar
		// For now, we'll use Node's built-in zlib with manual ZIP parsing
		// This is a simplified approach - in production, use a proper ZIP library

		const JSZip = require("jszip");
		const zip = await JSZip.loadAsync(zipData);

		const entries = Object.keys(zip.files);
		for (const entryName of entries) {
			const entry = zip.files[entryName];
			const destPath = path.join(this.assetsDir, entryName);

			if (entry.dir) {
				if (!fs.existsSync(destPath)) {
					fs.mkdirSync(destPath, { recursive: true });
				}
			} else {
				const content = await entry.async("nodebuffer");
				const dir = path.dirname(destPath);
				if (!fs.existsSync(dir)) {
					fs.mkdirSync(dir, { recursive: true });
				}
				fs.writeFileSync(destPath, content);
			}
		}
	}

	/**
	 * Remove downloaded assets (for troubleshooting)
	 */
	async removeAssets(): Promise<boolean> {
		if (!Platform.isDesktopApp || !this.assetsDir) {
			return false;
		}

		try {
			const fs = require("fs");
			if (fs.existsSync(this.assetsDir)) {
				fs.rmSync(this.assetsDir, { recursive: true, force: true });
			}
			this.assetsReady = false;
			return true;
		} catch (error) {
			console.error("CircuitJS: Error removing assets:", error);
			return false;
		}
	}
}
