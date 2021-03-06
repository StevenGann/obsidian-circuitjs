import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, MarkdownPostProcessorContext } from 'obsidian';
import Renderer, { CircuitRenderChild } from './circuitRenderer';

// Remember to rename these classes and interfaces!

export interface CircuitJsSettings {
	editable: boolean;
	editLink: boolean;
	circuitJsUrl: string;
	circuitTag: string;
}

const DEFAULT_SETTINGS: CircuitJsSettings = {
	editable: true,
	editLink: true,
	circuitJsUrl: "http://falstad.com/circuit/circuitjs.html",
	circuitTag: "circuitjs"
}



export default class CircuitJsPlugin extends Plugin {
	settings: CircuitJsSettings;
	renderer: Renderer;

	postprocessor = async (content: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
		ctx.addChild(new CircuitRenderChild(el, this, content, this.settings));
	}

	async onload() {
		await this.loadSettings();

		this.registerMarkdownCodeBlockProcessor(this.settings.circuitTag, this.postprocessor);
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}


class SampleSettingTab extends PluginSettingTab {
	plugin: CircuitJsPlugin;

	constructor(app: App, plugin: CircuitJsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for Obsidian CircuitJS'});

		new Setting(containerEl)
			.setName('Editable')
			.setDesc('If the simulation can be edited')
			.addToggle(boolean => boolean
				.setValue(this.plugin.settings.editable)
				.onChange(async (value) => {
					console.log('Editable: ' + value);
					this.plugin.settings.editable = value;
					await this.plugin.saveSettings();
				}));
	}
}
