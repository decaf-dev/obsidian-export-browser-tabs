# Export Browser Tabs

Export Browser Tabs is an Obsidian.md plugin for desktop only. It allows MacOS users to export their open browser tabs into an Obsidian note or a group of notes.

> [!NOTE]
> This plugin executes AppleScript. It will only work on a MacOS system.

## Table of contents

-   [Installation](#installation)
-   [Usage](#usage)
-   [License](#license)

## Installation

1. Install the [Obsidian BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin from Obsidian community plugin store
2. Enable the plugin
3. Open the plugin settings
4. Click **Add beta plugin**
5. Enter the repository url: **https://github.com/decaf-dev/obsidian-export-browser-tabs**
6. Click **Add plugin**
7. Navigate to the community plugins list
8. Enable **Export Browser Tabs**

## Usage

1. Open the Obsidian command prompt (cmd + shift + p)
2. Type `Export tabs`
3. Select `Export tabs into single note` or `Export tabs into multiple notes`
4. Press enter

## Settings

### Browser application name

The browser that you wish to pull tabs from

### Folder save path

The relative path of the folder to save to in Obsidian.md

### File name format

The title format of the note that will be created

## Development

1. Clone the github repository
2. Install [Bun.sh](https://bun.sh)
3. Build the project `bun run build`
4. Add a symbolic link from the `dist` folder to your vault's plugin folder

```shell
ln -s /obsidian-export-browser-tabs/dist /.obsidian/plugins/export-browser-tabs
```

5. Enable the plugin

## License

This plugin is distributed under the [MIT License](https://github.com/decaf-dev/obsidian-export-browser-tabs/blob/master/LICENSE)
