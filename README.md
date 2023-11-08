# Export Browser Tabs

## About

This is a basic Obsidian plugin that allows MacOS users to export their open browser tabs to a note in Obsidian. This is useful to organize your tabs in Obsidian for future use.

## Installation

1. Install the [Obsidian BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin from Obsidian community plugin store
2. Enable the plugin
3. Open the plugin settings
4. Click **Add beta plugin**
5. Enter the repository url with `.git`: **https://github.com/trey-wallis/obsidian-export-browser-tabs**
6. Click **Add plugin**

## Settings

-   Browser name - The browser that you wish to pull tabs from
-   Save path - The relative path of the folder to save to in Obsidian.md
-   Note title - The name of the note that will be created

## Usage

**PLEASE NOTE**

This plugin executes AppleScript. It will only work on a MacOS system.

1. Open the Obsidian command prompt (cmd + shift + p)
2. Type `Export tabs from browser`
3. Press enter
4. See your tab links in your note

## Development

1. Clone the github repository
2. Install [Bun](https://bun.sh)
3. Build the project `bun run build`
4. Add a symbolic link from the `dist` folder to your vault's plugin folder

-   `ln -s /obsidian-export-browser-tabs/dist /.obsidian/plugins/export-browser-tabs`

5. Enable the plugin

## License

This plugin is distributed under the [MIT License](https://github.com/trey-wallis/obsidian-export-browser-tabs/blob/master/LICENSE)
