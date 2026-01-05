/*
 * Private Mode plugin for Obsidian
 * Copyright 2025 Markus Moser
 * Licensed under the MIT License (http://opensource.org/licenses/MIT)
 */

import {addIcon, Menu, Platform, Plugin, setIcon,} from "obsidian";

enum Level {
    HidePrivate = "hide-private",
    RevealOnHover = "reveal-on-hover",
    RevealAll = "reveal-all",
}

enum CssClass {
    RevealAll = "private-mode-reveal-all",
    RevealOnHover = "private-mode-reveal-on-hover",
    UnprotectedScreenshare = "private-mode-unprotected-screenshare",
    BlurLinksToo = "private-mode-blur-links-too"
}

interface PrivateModePluginSettings {
    currentScreenshareProtection: boolean;
    blurLinksToo: boolean;
}

const DEFAULT_SETTINGS: Partial<PrivateModePluginSettings> = {
    currentScreenshareProtection:  true,
    blurLinksToo: true,
};

export default class PrivateModePlugin extends Plugin {
    statusBar: HTMLElement;
    statusBarSpan: HTMLSpanElement;
    settings: PrivateModePluginSettings;
    currentLevel: Level = Level.RevealOnHover;

    async onload() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
        this.statusBar = this.addStatusBarItem();
        this.statusBar.addClass("mod-clickable")
        this.statusBar.ariaLabel = "Toggle private mode"
        this.statusBar.setAttr("data-tooltip-position", "top")
        this.statusBar.onClickEvent((event) => {
            if (event.button != 0) {
                const menu = new Menu();
                menu.addItem((item) =>
                    item
                        .setTitle('Reveal all')
                        .setIcon('ph--eye')
                        .setChecked(this.currentLevel == Level.RevealAll)
                        .onClick(() => {
                            this.currentLevel = Level.RevealAll
                            this.updateGlobalRevealStyle();
                        })
                );
                menu.addItem((item) =>
                    item
                        .setTitle('Reveal on hover')
                        .setIcon('ph--eye-hand')
                        .setChecked(this.currentLevel == Level.RevealOnHover)
                        .onClick(() => {
                            this.currentLevel = Level.RevealOnHover
                            this.updateGlobalRevealStyle();
                        })
                );
                menu.addItem((item) =>
                    item
                        .setTitle('Reveal never')
                        .setIcon('ph--eye-closed')
                        .setChecked(this.currentLevel == Level.HidePrivate)
                        .onClick(() => {
                            this.currentLevel = Level.HidePrivate
                            this.updateGlobalRevealStyle();
                        })
                );
                menu.addSeparator()
                menu.addItem((item) =>
                    item
                        .setTitle('Blur Links too')
                        .setIcon('ph--link')
                        .setChecked(this.settings.blurLinksToo)
                        .onClick(() => {
                            this.settings.blurLinksToo = !this.settings.blurLinksToo;
                            item.setChecked(!this.settings.blurLinksToo)
                            this.updateGlobalRevealStyle();
                        })
                );
                menu.addItem((item) =>
                    item
                        .setTitle('Visibility when screensharing')
                        .setIcon('ph--screencast')
                        .setChecked(!this.settings.currentScreenshareProtection)
                        .onClick(() => {
                            this.settings.currentScreenshareProtection = !this.settings.currentScreenshareProtection;
                            item.setChecked(!this.settings.currentScreenshareProtection)
                            this.updateGlobalRevealStyle();
                        })
                );
                menu.showAtMouseEvent(event);
            } else {
                // left click
                if (event.altKey) {
                    this.settings.currentScreenshareProtection = !this.settings.currentScreenshareProtection;
                    this.updateGlobalRevealStyle();
                } else {
                    this.cycleCurrentLevel();
                    this.updateGlobalRevealStyle();
                }
            }
        });
        this.statusBarSpan = this.statusBar.createSpan( { text: "" });

        addIcon("ph--eye", eyeIcon);
        addIcon("ph--eye-hand", eyeHand);
        addIcon("ph--eye-closed", eyeClosedIcon);
        addIcon("ph--screencast", screencastIcon);
        addIcon("ph--link", linkIcon);

        this.addCommand({
            id: "hide-private",
            name: "Hide #private",
            callback: () => {
                this.currentLevel = Level.HidePrivate;
                this.updateGlobalRevealStyle();
            },
        });

        this.addCommand({
            id: "reveal-on-hover",
            name: "Reveal #private on hover",
            callback: () => {
                this.currentLevel = Level.RevealOnHover;
                this.updateGlobalRevealStyle();
            },
        });

        this.addCommand({
            id: "reveal-all",
            name: "Reveal #private always",
            callback: () => {
                this.currentLevel = Level.RevealAll;
                this.updateGlobalRevealStyle();
            },
        });

        this.addCommand({
            id: "cycle-mode",
            name: "Cycle #private mode",
            callback: () => {
                this.cycleCurrentLevel();
                this.updateGlobalRevealStyle();
            },
        });

        this.addCommand({
            id: "toggle-screenshare-protection",
            name: "Toggle screenshare protection",
            callback: () => {
                this.settings.currentScreenshareProtection = !this.settings.currentScreenshareProtection
                this.updateGlobalRevealStyle();
            },
        })

        this.app.workspace.onLayoutReady(() => {
            this.updateGlobalRevealStyle();
        });
    }

    private cycleCurrentLevel() {
        switch (this.currentLevel) {
            case Level.HidePrivate:
                this.currentLevel = Level.RevealOnHover;
                break;
            case Level.RevealOnHover:
                this.currentLevel = Level.RevealAll;
                break;
            case Level.RevealAll:
                this.currentLevel = Level.HidePrivate;
                break;
        }
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    updateGlobalRevealStyle() {
        this.saveSettings()
        this.removeAllClasses();
        this.setClassToDocumentBody();

        if (Platform.isDesktopApp) {
            window.require("electron").remote.getCurrentWindow().setContentProtection(this.settings.currentScreenshareProtection)
        }
    }

    removeAllClasses() {
        document.body.removeClass(
            CssClass.RevealAll,
            CssClass.RevealOnHover,
            CssClass.UnprotectedScreenshare,
            CssClass.BlurLinksToo
        );
    }

    setClassToDocumentBody() {
        if (!this.settings.currentScreenshareProtection) {
            document.body.classList.add(CssClass.UnprotectedScreenshare)
        }
        if (this.settings.blurLinksToo) {
            document.body.classList.add(CssClass.BlurLinksToo)
        }
        switch (this.currentLevel) {
            case Level.HidePrivate:
                setIcon(this.statusBarSpan, "ph--eye-closed")
                break;
            case Level.RevealOnHover:
                document.body.classList.add(CssClass.RevealOnHover);
                setIcon(this.statusBarSpan, "ph--eye-hand")
                break;
            case Level.RevealAll:
                document.body.classList.add(CssClass.RevealAll);
                setIcon(this.statusBarSpan, "ph--eye")
                break;
        }
    }

}

// https://icon-sets.iconify.design/ph/eye-closed/
const eyeClosedIcon = `<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 256"><path fill="currentColor" d="M228 175a8 8 0 0 1-10.92-3l-19-33.2A123.2 123.2 0 0 1 162 155.46l5.87 35.22a8 8 0 0 1-6.58 9.21a8.4 8.4 0 0 1-1.29.11a8 8 0 0 1-7.88-6.69l-5.77-34.58a133 133 0 0 1-36.68 0l-5.77 34.58A8 8 0 0 1 96 200a8.4 8.4 0 0 1-1.32-.11a8 8 0 0 1-6.58-9.21l5.9-35.22a123.2 123.2 0 0 1-36.06-16.69L39 172a8 8 0 1 1-13.94-8l20-35a153.5 153.5 0 0 1-19.3-20a8 8 0 1 1 12.46-10c16.6 20.54 45.64 45 89.78 45s73.18-24.49 89.78-45a8 8 0 1 1 12.44 10a153.5 153.5 0 0 1-19.3 20l20 35a8 8 0 0 1-2.92 11"/></svg>`;

// https://icon-sets.iconify.design/ph/hand-eye/
const eyeHand = `<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 256"><path fill="currentColor" d="M188 88a27.75 27.75 0 0 0-12 2.71V60a28 28 0 0 0-41.36-24.6A28 28 0 0 0 80 44v6.71A27.75 27.75 0 0 0 68 48a28 28 0 0 0-28 28v76a88 88 0 0 0 176 0v-36a28 28 0 0 0-28-28m12 64a72 72 0 0 1-144 0V76a12 12 0 0 1 24 0v36a8 8 0 0 0 16 0V44a12 12 0 0 1 24 0v60a8 8 0 0 0 16 0V60a12 12 0 0 1 24 0v60a8 8 0 0 0 16 0v-4a12 12 0 0 1 24 0Zm-60 16a12 12 0 1 1-12-12a12 12 0 0 1 12 12m-12-40c-36.52 0-54.41 34.94-55.16 36.42a8 8 0 0 0 0 7.16C73.59 173.06 91.48 208 128 208s54.41-34.94 55.16-36.42a8 8 0 0 0 0-7.16C182.41 162.94 164.52 128 128 128m0 64c-20.63 0-33.8-16.52-38.7-24c4.9-7.48 18.07-24 38.7-24s33.81 16.53 38.7 24c-4.9 7.48-18.07 24-38.7 24"/></svg>`;

// https://icon-sets.iconify.design/ph/eye/
const eyeIcon = `<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 256"><path fill="currentColor" d="M247.31 124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57 61.26 162.88 48 128 48S61.43 61.26 36.34 86.35C17.51 105.18 9 124 8.69 124.76a8 8 0 0 0 0 6.5c.35.79 8.82 19.57 27.65 38.4C61.43 194.74 93.12 208 128 208s66.57-13.26 91.66-38.34c18.83-18.83 27.3-37.61 27.65-38.4a8 8 0 0 0 0-6.5M128 192c-30.78 0-57.67-11.19-79.93-33.25A133.5 133.5 0 0 1 25 128a133.3 133.3 0 0 1 23.07-30.75C70.33 75.19 97.22 64 128 64s57.67 11.19 79.93 33.25A133.5 133.5 0 0 1 231.05 128c-7.21 13.46-38.62 64-103.05 64m0-112a48 48 0 1 0 48 48a48.05 48.05 0 0 0-48-48m0 80a32 32 0 1 1 32-32a32 32 0 0 1-32 32"/></svg>`;

// https://icon-sets.iconify.design/ph/screencast/
const screencastIcon = `<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 256"><path fill="currentColor" d="M232 56v144a16 16 0 0 1-16 16h-72a8 8 0 0 1 0-16h72V56H40v40a8 8 0 0 1-16 0V56a16 16 0 0 1 16-16h176a16 16 0 0 1 16 16M32 184a8 8 0 0 0 0 16a8 8 0 0 1 8 8a8 8 0 0 0 16 0a24 24 0 0 0-24-24m0-32a8 8 0 0 0 0 16a40 40 0 0 1 40 40a8 8 0 0 0 16 0a56.06 56.06 0 0 0-56-56m0-32a8 8 0 0 0 0 16a72.08 72.08 0 0 1 72 72a8 8 0 0 0 16 0a88.1 88.1 0 0 0-88-88"/></svg>`;

// https://icon-sets.iconify.design/ph/link/
const linkIcon = `<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 256"><path fill="currentColor" d="M240 88.23a54.43 54.43 0 0 1-16 37L189.25 160a54.27 54.27 0 0 1-38.63 16h-.05A54.63 54.63 0 0 1 96 119.84a8 8 0 0 1 16 .45A38.62 38.62 0 0 0 150.58 160a38.4 38.4 0 0 0 27.31-11.31l34.75-34.75a38.63 38.63 0 0 0-54.63-54.63l-11 11A8 8 0 0 1 135.7 59l11-11a54.65 54.65 0 0 1 77.3 0a54.86 54.86 0 0 1 16 40.23m-131 97.43l-11 11A38.4 38.4 0 0 1 70.6 208a38.63 38.63 0 0 1-27.29-65.94L78 107.31a38.63 38.63 0 0 1 66 28.4a8 8 0 0 0 16 .45A54.86 54.86 0 0 0 144 96a54.65 54.65 0 0 0-77.27 0L32 130.75A54.62 54.62 0 0 0 70.56 224a54.28 54.28 0 0 0 38.64-16l11-11a8 8 0 0 0-11.2-11.34"/></svg>`;
