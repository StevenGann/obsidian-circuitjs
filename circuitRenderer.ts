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
        console.log('Code: ' + this.code);
        console.log('Compressed: ' + this.compressed);

        this.url = 'http://falstad.com/circuit/circuitjs.html?ctz='+this.compressed;
    }

    onload() {
        this.containerEl.innerHTML = '<div>'+
        '<a href="'+this.url+'">[EDIT]</a>'+
        '<iframe src="'+this.url+'&running='+this.settings.editable+'&hideMenu=false" width="100%" height="600px"/>'+
        
        '</div>';
    }

    onunload() { 
    }
}