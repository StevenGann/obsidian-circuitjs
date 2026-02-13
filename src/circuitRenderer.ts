import { App, MarkdownRenderChild, Platform, FileSystemAdapter } from "obsidian";
import * as LZString from "lz-string";
import { CircuitJsSettings } from "./settings";

export class CircuitRenderChild extends MarkdownRenderChild {
	code: string;
	compressed: string;
	url: string;
	settings: CircuitJsSettings;
	app: App;

	constructor(
		el: HTMLElement,
		content: string,
		settings: CircuitJsSettings,
		app: App
	) {
		super(el);

		this.app = app;
		this.settings = settings;
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

		this.url = this.buildFullUrl();

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

		// Use webview for offline mode (desktop only), iframe for online mode
		if (this.settings.offlineMode && Platform.isDesktopApp) {
			this.createWebview(div);
		} else {
			this.createIframe(div);
		}

		this.containerEl.appendChild(div);
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
