import { App, PluginSettingTab, Setting } from "obsidian";
import CircuitJsPlugin from "./main";

export interface CircuitJsSettings {
	editable: boolean;
	editLink: boolean;
	circuitJsUrl: string;
	circuitTag: string;
}

export const DEFAULT_SETTINGS: CircuitJsSettings = {
	editable: true,
	editLink: true,
	circuitJsUrl: "https://falstad.com/circuit/circuitjs.html",
	circuitTag: "circuitjs"
};

export class CircuitJsSettingTab extends PluginSettingTab {
	plugin: CircuitJsPlugin;

	constructor(app: App, plugin: CircuitJsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Editable")
			.setDesc("Allow interaction with the embedded simulation")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.editable)
					.onChange(async (value) => {
						this.plugin.settings.editable = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Show edit link")
			.setDesc("Display an [EDIT] link to open circuit in full browser")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.editLink)
					.onChange(async (value) => {
						this.plugin.settings.editLink = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("CircuitJS URL")
			.setDesc("Base URL for CircuitJS (change for self-hosted instances)")
			.addText((text) =>
				text
					.setPlaceholder("https://falstad.com/circuit/circuitjs.html")
					.setValue(this.plugin.settings.circuitJsUrl)
					.onChange(async (value) => {
						this.plugin.settings.circuitJsUrl = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Code block tag")
			.setDesc("Tag used to identify CircuitJS code blocks (requires restart)")
			.addText((text) =>
				text
					.setPlaceholder("circuitjs")
					.setValue(this.plugin.settings.circuitTag)
					.onChange(async (value) => {
						this.plugin.settings.circuitTag = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
