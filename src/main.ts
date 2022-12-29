import { Extension } from "@codemirror/state";
import { App, Plugin, PluginSettingTab, Setting } from "obsidian";
import { highlightViolations } from "./highlight-violations";

interface ConstraintsSettings {
	highlightFifthGlyph: boolean;
}

const DEFAULT_SETTINGS: ConstraintsSettings = {
	highlightFifthGlyph: true,
};

export default class Constraints extends Plugin {
	settings: ConstraintsSettings;

	extensions: Extension[] = [];
	private loaded = false;

	async onload() {
		await this.loadSettings();

		this.loadEditorExtensions();
		this.registerEditorExtension(this.extensions);

		const toggleViolations =
			(shouldTurnOn: boolean) => (checking: boolean) => {
				if (checking) {
					return shouldTurnOn
						? !this.settings.highlightFifthGlyph
						: this.settings.highlightFifthGlyph;
				}

				this.settings.highlightFifthGlyph = shouldTurnOn;
				this.saveSettings();
				this.loadEditorExtensions();
			};

		this.addCommand({
			id: "highlight-violations",
			name: "Highlight Violations",
			checkCallback: toggleViolations(true),
		});

		this.addCommand({
			id: "unhighlight-violations",
			name: "Stop Highlighting Violations",
			checkCallback: toggleViolations(false),
		});

		this.addSettingTab(new ConstraintsSettingsTab(this.app, this));
		this.loaded = true;
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	loadEditorExtensions() {
		this.extensions.length = 0;
		if (this.settings.highlightFifthGlyph) {
			this.extensions.push(highlightViolations);
		}
		if (this.loaded) {
			this.app.workspace.updateOptions();
		}
	}
}

class ConstraintsSettingsTab extends PluginSettingTab {
	plugin: Constraints;

	constructor(app: App, plugin: Constraints) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Highlight Fifth Glyph")
			.setDesc(
				"When on, highlight violations containing our fifth glyph with background color."
			)
			.addToggle((cb) =>
				cb
					.setValue(this.plugin.settings.highlightFifthGlyph)
					.onChange(async (value) => {
						this.plugin.settings.highlightFifthGlyph = value;
						await this.plugin.saveSettings();
						this.plugin.loadEditorExtensions();
					})
			);
	}
}
