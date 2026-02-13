import { Plugin, MarkdownPostProcessorContext, Notice, Platform } from "obsidian";
import { CircuitRenderChild } from "./circuitRenderer";
import {
	CircuitJsSettings,
	DEFAULT_SETTINGS,
	CircuitJsSettingTab,
} from "./settings";
import { AssetManager } from "./assetManager";

export default class CircuitJsPlugin extends Plugin {
	settings: CircuitJsSettings;
	assetManager: AssetManager;

	postprocessor = async (
		content: string,
		el: HTMLElement,
		ctx: MarkdownPostProcessorContext
	): Promise<void> => {
		ctx.addChild(
			new CircuitRenderChild(el, content, this.settings, this.app, this.assetManager)
		);
	};

	async onload(): Promise<void> {
		await this.loadSettings();

		// Initialize asset manager
		this.assetManager = new AssetManager(this.app, this.settings);

		// Check for assets on desktop
		if (Platform.isDesktopApp && this.settings.offlineMode) {
			const assetsReady = await this.assetManager.checkAssets();

			if (!assetsReady) {
				// Prompt user to download assets
				new Notice(
					"CircuitJS: Offline assets not found. Click here to download.",
					10000
				);

				// Auto-download in background
				this.downloadAssetsWithNotice();
			}
		}

		this.addSettingTab(new CircuitJsSettingTab(this.app, this));

		this.registerMarkdownCodeBlockProcessor(
			this.settings.circuitTag,
			this.postprocessor
		);

		// Add command to manually download/update assets
		this.addCommand({
			id: "download-circuitjs-assets",
			name: "Download CircuitJS offline assets",
			callback: () => this.downloadAssetsWithNotice(),
		});

		// Add command to remove assets (for troubleshooting)
		this.addCommand({
			id: "remove-circuitjs-assets",
			name: "Remove CircuitJS offline assets",
			callback: async () => {
				const removed = await this.assetManager.removeAssets();
				if (removed) {
					new Notice("CircuitJS: Offline assets removed.");
				} else {
					new Notice("CircuitJS: Failed to remove assets.");
				}
			},
		});
	}

	/**
	 * Download assets with user-facing notifications
	 */
	async downloadAssetsWithNotice(): Promise<void> {
		const notice = new Notice("CircuitJS: Downloading offline assets...", 0);

		const success = await this.assetManager.downloadAssets((message) => {
			notice.setMessage(`CircuitJS: ${message}`);
		});

		// Hide the progress notice
		notice.hide();

		if (success) {
			new Notice("CircuitJS: Offline assets installed successfully!", 5000);
		} else {
			new Notice(
				"CircuitJS: Failed to download assets. Check console for details.",
				10000
			);
		}
	}

	onunload(): void {
		// Cleanup if needed
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<CircuitJsSettings>
		);
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
