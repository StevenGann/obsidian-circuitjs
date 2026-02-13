import { Plugin, MarkdownPostProcessorContext } from "obsidian";
import { CircuitRenderChild } from "./circuitRenderer";
import {
	CircuitJsSettings,
	DEFAULT_SETTINGS,
	CircuitJsSettingTab,
} from "./settings";

export default class CircuitJsPlugin extends Plugin {
	settings: CircuitJsSettings;

	postprocessor = async (
		content: string,
		el: HTMLElement,
		ctx: MarkdownPostProcessorContext
	): Promise<void> => {
		ctx.addChild(new CircuitRenderChild(el, content, this.settings));
	};

	async onload(): Promise<void> {
		await this.loadSettings();

		this.addSettingTab(new CircuitJsSettingTab(this.app, this));

		this.registerMarkdownCodeBlockProcessor(
			this.settings.circuitTag,
			this.postprocessor
		);
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
