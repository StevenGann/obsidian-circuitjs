import { App, Platform, FileSystemAdapter, requestUrl } from "obsidian";
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

		// Get plugin directory path using Obsidian's configDir (supports custom config directories)
		const adapter = this.app.vault.adapter;
		if (adapter instanceof FileSystemAdapter) {
			const basePath = adapter.getBasePath();
			const configDir = this.app.vault.configDir;
			this.pluginDir = `${basePath}/${configDir}/plugins/obsidian-circuitjs`;
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
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			const fs = require("fs");
			// eslint-disable-next-line @typescript-eslint/no-require-imports
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
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const fs = require("fs");
		// eslint-disable-next-line @typescript-eslint/no-require-imports
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
	 * Remove downloaded assets (for troubleshooting)
	 */
	async removeAssets(): Promise<boolean> {
		if (!Platform.isDesktopApp || !this.assetsDir) {
			return false;
		}

		try {
			// eslint-disable-next-line @typescript-eslint/no-require-imports
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
