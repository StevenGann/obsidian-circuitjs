import { MarkdownRenderChild } from "obsidian";
import * as LZString from "lz-string";
import { CircuitJsSettings } from "./settings";

export class CircuitRenderChild extends MarkdownRenderChild {
	code: string;
	compressed: string;
	url: string;
	settings: CircuitJsSettings;

	constructor(el: HTMLElement, content: string, settings: CircuitJsSettings) {
		super(el);

		this.settings = settings;
		this.code = content;

		this.compressed = LZString.compressToEncodedURIComponent(this.code);

		const running = this.settings.editable ? "true" : "false";
		this.url = `${this.settings.circuitJsUrl}?ctz=${this.compressed}&running=${running}`;
	}

	onload(): void {
		const div = document.createElement("div");

		if (this.settings.editLink) {
			const editLink = document.createElement("a");
			editLink.setAttribute("href", this.url);
			editLink.setAttribute("target", "_blank");
			editLink.setAttribute("rel", "noopener noreferrer");
			const editLinkContent = document.createTextNode("[EDIT]");
			editLink.appendChild(editLinkContent);
			div.appendChild(editLink);
		}

		const iframeNode = document.createElement("iframe");
		iframeNode.setAttribute("src", this.url);
		iframeNode.setAttribute("width", "100%");
		iframeNode.setAttribute("height", "600px");

		div.appendChild(iframeNode);

		this.containerEl.appendChild(div);
	}

	onunload(): void {
		// Cleanup if needed
	}
}
