import { MarkdownPostProcessorContext, MarkdownRenderChild, parseYaml } from 'obsidian';
import { LZStringStatic } from 'lz-string';
import * as LZString from 'lz-string';
import { CircuitJsSettings } from 'main';

export default class Renderer {

}

export class CircuitRenderChild extends MarkdownRenderChild {
    code: string;
    compressed: string;
    url: string;
    renderer: Renderer;
    settings: CircuitJsSettings;

    constructor(el: HTMLElement, renderer: Renderer, content: string, settings: CircuitJsSettings) {
        super(el);

        this.settings = settings;
        this.code = content;

        this.compressed = LZString.compressToEncodedURIComponent(this.code);
        
        if(this.settings.editable)
        {
            this.url = `${this.settings.circuitJsUrl}?ctz=${this.compressed}&running=true`;
        }
        else
        {
            this.url = `${this.settings.circuitJsUrl}?ctz=${this.compressed}&running=false`;
        }
    }

    onload() {
        const div = document.createElement("div");

        if (this.settings.editLink) {
            const editLink = document.createElement("a");
            editLink.setAttribute("href", this.url);
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

    onunload() {
    }
}