# Clever CSS

Augmented Intellisense for CSS files.

## Features

### Class Autocompletion

CSS class completion as you type.

![Class Autocompletion](images/autocomplete.gif)

### Diagnostics

Warnings for unused and duplicated CSS classes (configurable).

![Diagnostics](images/diagnostics.gif)

### Tree View

A tree view of all CSS classes in your workspace. Clicking on a class will navigate to its definition.

<img src="images/tree-view.png" alt="Tree View" width="300" />

### Definition Provider

Navigate to the definition of a CSS class with Ctrl/Cmd + Click. Also see the definition on hover.

![Definition Provider](images/definitions.gif)

### Other Features

- Reference provider for all definitions and usages of a CSS class.

## Requirements

- VS Code 1.120.0 or higher

## Extension Settings

You can disable diagnostics in your `settings.json`:

```json
{
  "clever-css.diagnostics": {
    "unusedClasses": false, // Disable unused class warnings
    "duplicatedClasses": false // Disable duplicated class warnings
  }
}
```

## Known Issues

### The tree view, definitions, or references have become out of sync

If the extension ever becomes out of sync, you can click the refresh button in the "All Classes" tree view to force a rescan of your workspace.

<img src="images/reset.png" alt="Tree View" width="300" />

If you can reproduce the problem, I'd appreciate it if you could open an issue!

### I don't see some definitions in references when I execute the Find All References command

Built-in VS Code reference provider should provide references for definitions found in the same file. If you don't see them, probably VS Code is not recognizing your file as a CSS file, maybe because you have an extension like [PostCSS Language Support](https://marketplace.visualstudio.com/items?itemName=csstools.postcss) installed. The solution is to configure file associations of CSS files in your `settings.json`:

```json
{
  "files.associations": {
    "*.css": "css"
  }
}
```

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

- Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
- Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
- Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

- [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
- [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
