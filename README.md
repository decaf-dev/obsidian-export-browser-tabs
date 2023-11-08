# Export Browser Tabs

## About

This is a basic Obsidian plugin that allows MacOS users to export their open browser tabs to a note in Obsidian. This is useful to organize your tabs in Obsidian for future use.

## Installation

### From release

1. Install the [Obsidian BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin from Obsidian community plugin store
2. Enable the plugin
3. Open the plugin settings
4. Click **Add beta plugin**
5. Enter the repository url with `.git`: **https://github.com/trey-wallis/obsidian-export-browser-tabs**
6. Click **Add plugin**

### From clone

1. Clone the github repository
2. Install [bun](https://bun.sh)
3. Build the project `bun run build`
4. Add a symbolic link from the `dist`` folder to your vault's plugin folder

-   `ln -s /obsidian-export-browser-tabs/dist /.obsidian/plugins/obsidian-export-browser-tabs`

5. Enable the plugin

## Settings

-   Browser name
-   Save path
-   Note title

## Usage

Open the Obsidian command prompt (cmd + shift + p) and type `Export tabs from browser`
