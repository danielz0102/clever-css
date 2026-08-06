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

Calling out known issues can help limit users opening duplicate issues against your extension.

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
