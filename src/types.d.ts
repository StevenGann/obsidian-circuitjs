/**
 * TypeScript declarations for Electron webview element
 *
 * The <webview> element is an Electron-specific element that allows
 * embedding web content in a separate process. It's not part of the
 * standard DOM types, so we need to declare it here.
 *
 * @see https://www.electronjs.org/docs/latest/api/webview-tag
 */

declare global {
	interface HTMLElementTagNameMap {
		webview: HTMLWebViewElement;
	}

	interface HTMLWebViewElement extends HTMLElement {
		/** URL to load in the webview */
		src: string;

		/** Storage partition for the webview session */
		partition: string;

		/** Allow the webview to open new windows */
		allowpopups: string;

		/** Preload script to run before page loads */
		preload: string;

		/** Get the WebContents ID for IPC communication */
		getWebContentsId(): number;

		/** Navigate to a URL */
		loadURL(url: string): void;

		/** Reload the current page */
		reload(): void;

		/** Stop loading */
		stop(): void;

		/** Go back in history */
		goBack(): void;

		/** Go forward in history */
		goForward(): void;

		/** Check if can go back */
		canGoBack(): boolean;

		/** Check if can go forward */
		canGoForward(): boolean;

		/** Execute JavaScript in the webview context */
		executeJavaScript(code: string): Promise<unknown>;

		/** Open DevTools for the webview */
		openDevTools(): void;

		/** Close DevTools */
		closeDevTools(): void;

		/** Check if DevTools is open */
		isDevToolsOpened(): boolean;
	}

	// Webview event types
	interface WebviewLoadEvent extends Event {
		readonly url: string;
		readonly isMainFrame: boolean;
		readonly frameProcessId: number;
		readonly frameRoutingId: number;
	}

	interface WebviewFailLoadEvent extends Event {
		readonly errorCode: number;
		readonly errorDescription: string;
		readonly validatedURL: string;
		readonly isMainFrame: boolean;
	}
}

export {};
