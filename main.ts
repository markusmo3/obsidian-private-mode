/*
  Privacy Glasses plugin for Obsidian
  Copyright 2021 Jill Alberts
  Licensed under the MIT License (http://opensource.org/licenses/MIT)
*/

import {
    addIcon,
    Plugin,
    setIcon,
} from "obsidian";

enum Level {
    HidePrivate = "hide-private",
    RevealAll = "reveal-all",
}

enum CssClass {
    RevealAll = "private-mode-reveal-all",
}

export default class PrivacyGlassesPlugin extends Plugin {
    statusBar: HTMLElement;
    statusBarSpan: HTMLSpanElement;
    currentLevel: Level = Level.HidePrivate;

    async onload() {
        this.statusBar = this.addStatusBarItem();
        this.statusBar.addClass("mod-clickable")
        this.statusBar.ariaLabel = "Toggle Private Mode"
        this.statusBar.setAttr("data-tooltip-position", "top")
        this.statusBar.onClickEvent(() => {
            this.currentLevel = this.currentLevel == Level.HidePrivate ? Level.RevealAll : Level.HidePrivate;
            this.updateGlobalRevealStyle();
        });
        this.statusBarSpan = this.statusBar.createSpan( { text: "" });

        addIcon("eye", eyeIcon);
        addIcon("eye-closed", eyeClosedIcon);

        this.addRibbonIcon("eye-closed", "Hide Private", () => {
            this.currentLevel = Level.HidePrivate;
            this.updateGlobalRevealStyle();
        });
        this.addRibbonIcon("eye", "Reveal all", () => {
            this.currentLevel = Level.RevealAll;
            this.updateGlobalRevealStyle();
        });

        this.addCommand({
            id: "privacy-glasses-hide-private",
            name: "Hide Private",
            callback: () => {
                this.currentLevel = Level.HidePrivate;
                this.updateGlobalRevealStyle();
            },
        });

        this.addCommand({
            id: "privacy-glasses-reveal-all",
            name: "Reveal all",
            callback: () => {
                this.currentLevel = Level.RevealAll;
                this.updateGlobalRevealStyle();
            },
        });

        this.app.workspace.onLayoutReady(() => {
            this.updateGlobalRevealStyle();
        });
    }

    updateGlobalRevealStyle() {
        this.removeAllClasses();
        this.setClassToDocumentBody(this.currentLevel);
    }

    removeAllClasses() {
        document.body.removeClass(
            CssClass.RevealAll,
        );
    }

    setClassToDocumentBody(currentLevel: Level) {
        switch (currentLevel) {
            case Level.HidePrivate:
                setIcon(this.statusBarSpan, "eye-closed")
                break;
            case Level.RevealAll:
                document.body.classList.add(CssClass.RevealAll);
                setIcon(this.statusBarSpan, "eye")
                break;
        }
    }

}

// https://icon-sets.iconify.design/ph/eye-closed-bold/
const eyeClosedIcon = `<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 256"><path fill="currentColor" d="M234.4 160.8a12 12 0 0 1-10.4 18a11.8 11.8 0 0 1-10.4-6l-16.3-28.2a126 126 0 0 1-29.4 13.5l5.2 29.4a11.9 11.9 0 0 1-9.7 13.9l-2.1.2a12 12 0 0 1-11.8-9.9l-5.1-28.7a123.5 123.5 0 0 1-16.4 1a146.3 146.3 0 0 1-16.5-1l-5.1 28.7a12 12 0 0 1-11.8 9.9l-2.1-.2a11.9 11.9 0 0 1-9.7-13.9l5.2-29.4a125.3 125.3 0 0 1-29.3-13.5L42.3 173a12.1 12.1 0 0 1-10.4 6a11.7 11.7 0 0 1-6-1.6a12 12 0 0 1-4.4-16.4l17.9-31a142.4 142.4 0 0 1-16.7-17.6a12 12 0 1 1 18.6-15.1C57.1 116.8 84.9 140 128 140s70.9-23.2 86.7-42.7a12 12 0 1 1 18.6 15.1a150.3 150.3 0 0 1-16.7 17.7Z"/></svg>`;

// https://icon-sets.iconify.design/ph/eye/
const eyeIcon = `<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 256"><path fill="currentColor" d="M247.3 124.8c-.3-.8-8.8-19.6-27.6-38.5C194.6 61.3 162.9 48 128 48S61.4 61.3 36.3 86.3C17.5 105.2 9 124 8.7 124.8a7.9 7.9 0 0 0 0 6.4c.3.8 8.8 19.6 27.6 38.5c25.1 25 56.8 38.3 91.7 38.3s66.6-13.3 91.7-38.3c18.8-18.9 27.3-37.7 27.6-38.5a7.9 7.9 0 0 0 0-6.4ZM128 192c-30.8 0-57.7-11.2-79.9-33.3A130.3 130.3 0 0 1 25 128a130.3 130.3 0 0 1 23.1-30.8C70.3 75.2 97.2 64 128 64s57.7 11.2 79.9 33.2A130.3 130.3 0 0 1 231 128c-7.2 13.5-38.6 64-103 64Zm0-112a48 48 0 1 0 48 48a48 48 0 0 0-48-48Zm0 80a32 32 0 1 1 32-32a32.1 32.1 0 0 1-32 32Z"/></svg>`;
