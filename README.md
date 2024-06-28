# Export Browser Tabs

Export Browser Tabs is an [Obsidian.md](https://obsidian.md) plugin for desktop only. It allows MacOS users to export their open browser tabs into a single note or multiple notes.

> [!NOTE]
> This plugin executes AppleScript. It will only work on a device running MacOS.

## Table of contents

-   [Installation](#installation)
-   [Usage](#usage)
-   [Settings](#settings)
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

### Export into single note

This command will export all links into one file

1. Open the Obsidian command palette
2. Type **Export tabs**
3. Click **Export tabs into single note**
4. Press enter

### Export into multiple notes

This command will export each link into its own file

1. Open the Obsidian command palette
2. Type **Export tabs**
3. Click **Export tabs into multiple notes**
4. Press enter

### Export into multiple notes (remote)

This command will pull from your Android device and export each link into its own file

1. Open the Obsidian command palette
2. Type **Export tabs**
3. Click **Export tabs into multiple notes (Remote)**
4. Press enter

## Settings

### Local browser name

The name of your local browser. e.g. **brave**

### Remote browser name

The name of your remote browser. e.g. **brave**

### ADB

The absolute path of your Android Development Bridge application. This is used if you want to export notes from an Android device.

### Folder path

The path in Obsidian that you want the exported files to save to

### File name

The file name that the file should be exported to. A timestamp will be added to the end. e.g. `browser-tabs-1719556748`

### Export title and url

If true both the title and url will be exported. Otherwise, only the url will be exported.

```markdown
# Enabled

[Google](https://google.com)

# Disabled

https://google.com
```

### URL Property

If you wish to save your exported files in a property, you may enter a value.

## License

This plugin is distributed under the [MIT License](https://github.com/decaf-dev/obsidian-export-browser-tabs/blob/master/LICENSE)
