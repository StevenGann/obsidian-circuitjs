import { App, Platform, PluginSettingTab, Setting } from "obsidian";
import CircuitJsPlugin from "./main";

export interface CircuitJsSettings {
	editable: boolean;
	editLink: boolean;
	circuitJsUrl: string;
	circuitTag: string;
	offlineMode: boolean;
}

export const DEFAULT_SETTINGS: CircuitJsSettings = {
	editable: true,
	editLink: true,
	circuitJsUrl: "https://falstad.com/circuit/circuitjs.html",
	circuitTag: "circuitjs",
	offlineMode: true
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

		// Offline mode section
		containerEl.createEl("h3", { text: "Offline Mode" });

		new Setting(containerEl)
			.setName("Offline mode")
			.setDesc(
				"Use bundled CircuitJS for offline support (desktop only). " +
				"Disable to use the remote URL instead."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.offlineMode)
					.onChange(async (value) => {
						this.plugin.settings.offlineMode = value;
						await this.plugin.saveSettings();
						this.display(); // Refresh to update asset status
					})
			);

		// Show asset status only on desktop when offline mode is enabled
		if (Platform.isDesktopApp && this.plugin.settings.offlineMode) {
			const assetsReady = this.plugin.assetManager.areAssetsReady();

			const assetSetting = new Setting(containerEl)
				.setName("Offline assets")
				.setDesc(
					assetsReady
						? "✓ CircuitJS assets are installed and ready."
						: "✗ CircuitJS assets not installed. Click to download."
				);

			if (assetsReady) {
				assetSetting.addButton((button) =>
					button
						.setButtonText("Reinstall")
						.setTooltip("Download and reinstall CircuitJS assets")
						.onClick(async () => {
							await this.plugin.downloadAssetsWithNotice();
							this.display();
						})
				);
				assetSetting.addButton((button) =>
					button
						.setButtonText("Remove")
						.setWarning()
						.setTooltip("Remove downloaded assets")
						.onClick(async () => {
							await this.plugin.assetManager.removeAssets();
							this.display();
						})
				);
			} else {
				assetSetting.addButton((button) =>
					button
						.setButtonText("Download Assets")
						.setCta()
						.onClick(async () => {
							await this.plugin.downloadAssetsWithNotice();
							this.display();
						})
				);
			}
		}

		// Display section
		containerEl.createEl("h3", { text: "Display" });

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

		// Advanced section
		containerEl.createEl("h3", { text: "Advanced" });

		new Setting(containerEl)
			.setName("CircuitJS URL")
			.setDesc("Base URL for CircuitJS (used when offline mode is disabled)")
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
