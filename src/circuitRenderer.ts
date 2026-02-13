import { App, MarkdownRenderChild, Platform, FileSystemAdapter } from "obsidian";
import * as LZString from "lz-string";
import { CircuitJsSettings } from "./settings";
import { AssetManager } from "./assetManager";

export class CircuitRenderChild extends MarkdownRenderChild {
	code: string;
	compressed: string;
	url: string;
	settings: CircuitJsSettings;
	app: App;
	assetManager: AssetManager;

	constructor(
		el: HTMLElement,
		content: string,
		settings: CircuitJsSettings,
		app: App,
		assetManager: AssetManager
	) {
		super(el);

		this.app = app;
		this.settings = settings;
		this.assetManager = assetManager;
		this.code = content;
		this.compressed = LZString.compressToEncodedURIComponent(this.code);
	}

	/**
	 * Get the CircuitJS URL based on offline/online mode
	 */
	private getCircuitJsUrl(): string {
		if (this.settings.offlineMode && Platform.isDesktopApp) {
			const adapter = this.app.vault.adapter;
			if (adapter instanceof FileSystemAdapter) {
				const basePath = adapter.getBasePath();
				// Plugin assets are in .obsidian/plugins/circuitjs/circuitjs/
				const pluginPath = `${basePath}/.obsidian/plugins/circuitjs/circuitjs/circuitjs.html`;
				// Normalize path separators for Windows and ensure proper file:// URL format
				const normalizedPath = pluginPath.replace(/\\/g, "/");
				return `file:///${normalizedPath}`;
			}
		}
		return this.settings.circuitJsUrl;
	}

	/**
	 * Build the full URL with circuit data and parameters
	 */
	private buildFullUrl(): string {
		const baseUrl = this.getCircuitJsUrl();
		const running = this.settings.editable ? "true" : "false";
		return `${baseUrl}?ctz=${this.compressed}&running=${running}`;
	}

	/**
	 * Get the online URL for the edit link (always uses remote URL)
	 */
	private getEditUrl(): string {
		const running = "true"; // Edit mode should always be interactive
		return `${this.settings.circuitJsUrl}?ctz=${this.compressed}&running=${running}`;
	}

	onload(): void {
		const div = document.createElement("div");
		div.addClass("circuitjs-container");

		// Edit link - always uses online URL for full browser experience
		if (this.settings.editLink) {
			const editLink = document.createElement("a");
			editLink.setAttribute("href", this.getEditUrl());
			editLink.setAttribute("target", "_blank");
			editLink.setAttribute("rel", "noopener noreferrer");
			editLink.addClass("circuitjs-edit-link");
			editLink.appendChild(document.createTextNode("[EDIT]"));
			div.appendChild(editLink);
		}

		// Check if we should use offline mode and if assets are ready
		const useOffline = this.settings.offlineMode &&
			Platform.isDesktopApp &&
			this.assetManager.areAssetsReady();

		if (this.settings.offlineMode && Platform.isDesktopApp && !this.assetManager.areAssetsReady()) {
			// Show message that assets are downloading/missing
			this.createAssetsMissingMessage(div);
		} else if (useOffline) {
			this.url = this.buildFullUrl();
			this.createWebview(div);
		} else {
			this.url = this.buildFullUrl();
			this.createIframe(div);
		}

		this.containerEl.appendChild(div);
	}

	/**
	 * Show a message when offline assets are missing
	 */
	private createAssetsMissingMessage(container: HTMLElement): void {
		const messageDiv = document.createElement("div");
		messageDiv.addClass("circuitjs-assets-missing");
		messageDiv.innerHTML = `
			<p><strong>CircuitJS offline assets not installed.</strong></p>
			<p>Use the command palette (Ctrl/Cmd+P) and run:<br>
			<code>CircuitJS: Download CircuitJS offline assets</code></p>
			<p>Or disable offline mode in settings to use the online version.</p>
		`;
		container.appendChild(messageDiv);

		// Also show a fallback iframe with online version
		const fallbackNote = document.createElement("p");
		fallbackNote.addClass("circuitjs-fallback-note");
		fallbackNote.textContent = "Showing online version as fallback:";
		container.appendChild(fallbackNote);

		// Use online URL as fallback
		this.url = this.buildOnlineUrl();
		this.createIframe(container);
	}

	/**
	 * Build URL using online CircuitJS (fallback)
	 */
	private buildOnlineUrl(): string {
		const running = this.settings.editable ? "true" : "false";
		return `${this.settings.circuitJsUrl}?ctz=${this.compressed}&running=${running}`;
	}

	/**
	 * Create an Electron webview element for offline mode
	 * Webview supports file:// URLs without CSP restrictions
	 */
	private createWebview(container: HTMLElement): void {
		const webviewNode = document.createElement("webview");

		webviewNode.setAttribute("src", this.url);
		webviewNode.setAttribute("allowpopups", "");
		// Partition isolates storage/cookies per plugin instance
		// @ts-expect-error - appId exists on App but not in types
		const appId = this.app.appId || "default";
		webviewNode.setAttribute("partition", `persist:circuitjs-${appId}`);
		webviewNode.addClass("circuitjs-webview");

		// Add error handling for webview
		webviewNode.addEventListener("did-fail-load", (event) => {
			console.error("CircuitJS webview failed to load:", event);
			// Could fall back to iframe here if needed
		});

		container.appendChild(webviewNode);
	}

	/**
	 * Create a standard iframe element for online mode
	 */
	private createIframe(container: HTMLElement): void {
		const iframeNode = document.createElement("iframe");

		iframeNode.setAttribute("src", this.url);
		iframeNode.setAttribute("width", "100%");
		iframeNode.setAttribute("height", "600px");
		iframeNode.addClass("circuitjs-iframe");

		container.appendChild(iframeNode);
	}

	onunload(): void {
		// Clean up webview/iframe to free resources
		this.containerEl.empty();
	}
}
