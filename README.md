# GTK FFI for Deno

High-level TypeScript bindings for GTK4 and libadwaita using Deno's FFI (Foreign
Function Interface).

**Available on JSR:** `@sigmasd/gtk`

## Overview

This project provides idiomatic TypeScript wrappers around GTK4, GLib, GIO,
GObject, and libadwaita, allowing you to build native desktop applications using
Deno. The library abstracts away low-level pointer manipulation and provides a
clean, object-oriented API similar to native GTK bindings in other languages.

**Cross-platform support:** Works on Linux, macOS, and Windows (via MSYS2/GTK
for Windows).

## Installation

Import directly from JSR in your Deno project:

```typescript
import {
  Application,
  ApplicationWindow,
  Button,
  Label,
} from "jsr:@sigmasd/gtk";
```

Or add to your `deno.json`:

```json
{
  "imports": {
    "@sigmasd/gtk": "jsr:@sigmasd/gtk"
  }
}
```

Then import:

```typescript
import { Application, Button } from "@sigmasd/gtk";
```

## Quick Start

### Simple Example

```typescript
import {
  Application,
  ApplicationWindow,
  Box,
  Button,
  GTK_ORIENTATION_VERTICAL,
  Label,
} from "jsr:@sigmasd/gtk";

const app = new Application("com.example.HelloWorld", 0);

app.connect("activate", () => {
  const win = new ApplicationWindow(app);
  win.setTitle("Hello World");
  win.setDefaultSize(400, 300);

  const box = new Box(GTK_ORIENTATION_VERTICAL, 12);
  box.setMarginTop(24);
  box.setMarginBottom(24);
  box.setMarginStart(24);
  box.setMarginEnd(24);

  const label = new Label("Hello, GTK! 👋");
  box.append(label);

  const button = new Button("Click Me!");
  button.connect("clicked", () => {
    label.setText("Button clicked! 🎉");
  });
  box.append(button);

  win.setChild(box);
  win.setProperty("visible", true);
});

app.run([]);
```

### Run the Example

```bash
# Using JSR
deno run --allow-ffi your-app.ts

# Or from the repository
deno run --allow-ffi examples/simple.ts
```

## Examples

The repository's `examples/` directory contains sample applications:

- **`simple.ts`**: Minimal hello world example with button
- **`widgets-demo.ts`**: Comprehensive demo showing various widgets:
  - Buttons and event handling
  - Text entry fields
  - Dropdown menus
  - List boxes
  - Scrolled windows
  - Frames and containers

Run examples:

```bash
# Simple example
deno run --allow-ffi examples/simple.ts

# Widgets demo
deno run --allow-ffi examples/widgets-demo.ts
```

## Available Widgets

### Containers

- `Box` - Horizontal/vertical container
- `Frame` - Container with border and optional label
- `ScrolledWindow` - Scrollable container
- `ListBox` - Vertical list container
- `ToolbarView` - Adwaita toolbar view

### Basic Widgets

- `Label` - Text display
- `Button` - Clickable button
- `Entry` - Text input field
- `DropDown` - Dropdown selection menu
- `MenuButton` - Button that opens a menu

### Windows

- `Window` - Basic window
- `ApplicationWindow` - Main application window
- `PreferencesWindow` - Adwaita preferences dialog
- `MessageDialog` - Adwaita message/confirmation dialog
- `AboutDialog` - About dialog

### Adwaita Widgets

- `HeaderBar` - Modern GNOME header bar
- `ActionRow` - List row with title/subtitle
- `ComboRow` - Combo box row for preferences
- `PreferencesPage` - Page for preferences window
- `PreferencesGroup` - Group within preferences page

### Other

- `Builder` - Load UI from XML files
- `Menu` - Application menu
- `SimpleAction` - Application action
- `StyleManager` - Theme and appearance management

## Usage

```typescript
// Import main widgets
import {
  Application,
  ApplicationWindow,
  Box,
  Button,
  Entry,
  Label,
} from "jsr:@sigmasd/gtk";

// Import constants
import {
  GTK_ORIENTATION_HORIZONTAL,
  GTK_ORIENTATION_VERTICAL,
} from "jsr:@sigmasd/gtk";

// Import Adwaita widgets
import { HeaderBar, PreferencesWindow, StyleManager } from "jsr:@sigmasd/gtk";

// Import event loop utilities (optional)
import { runMainLoop } from "jsr:@sigmasd/gtk/eventloop";
```

## API Highlights

### Creating Widgets

```typescript
// Create widgets
const label = new Label("Hello");
const button = new Button("Click");
const entry = new Entry();
```

### Setting Properties

```typescript
// Type-safe property setting
widget.setProperty("visible", true);
widget.setProperty("margin-top", 12);
widget.setProperty("halign", 3); // GTK_ALIGN_CENTER
```

### Connecting Signals

```typescript
button.connect("clicked", () => {
  console.log("Button clicked!");
});

window.connect("close-request", () => {
  console.log("Window closing");
  return false; // Allow close
});
```

### Container Management

```typescript
const box = new Box(GTK_ORIENTATION_VERTICAL, 12);
box.append(label);
box.append(button);
box.remove(button);
```

### Application Lifecycle

```typescript
const app = new Application("com.example.App", 0);

app.connect("activate", () => {
  // Create and show your main window
});

const exitCode = app.run([]);
Deno.exit(exitCode);
```

## Architecture

### Low-Level FFI (`src/gtk-ffi.ts`)

The core module handles:

- Dynamic library loading (`dlopen`)
- FFI symbol definitions
- Raw GTK/GLib C function bindings
- Memory management (GObject reference counting)

### High-Level Wrappers

Object-oriented classes that:

- Wrap raw pointers in TypeScript classes
- Provide idiomatic methods
- Handle C string conversions
- Manage GValue conversions for properties
- Register and manage signal callbacks

## Development

### Project Structure

```
gtk/
├── src/
│   ├── gtk-ffi.ts      # Main FFI bindings and wrappers
│   └── eventloop.ts    # Event loop utilities
├── examples/
│   ├── simple.ts       # Simple hello world
│   └── widgets-demo.ts # Comprehensive widget demo
├── deno.json           # Package configuration
└── README.md
```

### Adding New Widgets

1. Add FFI symbol definitions to the appropriate `dlopen` call
2. Create a high-level wrapper class extending `Widget` or `GObject`
3. Implement constructor and common methods
4. Export the class

Example:

```typescript
// 1. Add FFI binding
const gtk = Deno.dlopen(LINUX_LIB_PATHS.gtk, {
  // ... existing symbols ...
  gtk_my_widget_new: { parameters: [], result: "pointer" },
  gtk_my_widget_set_text: { parameters: ["pointer", "buffer"], result: "void" },
});

// 2. Create wrapper class
export class MyWidget extends Widget {
  constructor() {
    const ptr = gtk.symbols.gtk_my_widget_new();
    super(ptr);
  }

  setText(text: string): void {
    const textCStr = cstr(text);
    gtk.symbols.gtk_my_widget_set_text(this.ptr, textCStr);
  }
}
```

## Known Limitations

- **Limited widgets**: Not all GTK widgets are wrapped yet
- **No CSS provider**: Custom styling via CSS not yet supported
- **Signal lifetime**: Callbacks remain valid for process lifetime (no explicit
  disconnect/cleanup yet)
- **Platform testing**: While cross-platform library loading is implemented,
  primary testing has been on Linux

## Getting Started with Your First App

Create a new file `my-app.ts`:

```typescript
import {
  Application,
  ApplicationWindow,
  Box,
  Button,
  GTK_ORIENTATION_VERTICAL,
  Label,
} from "jsr:@sigmasd/gtk";

const app = new Application("com.example.MyApp", 0);

app.connect("activate", () => {
  const win = new ApplicationWindow(app);
  win.setTitle("My First GTK App");
  win.setDefaultSize(400, 300);

  const box = new Box(GTK_ORIENTATION_VERTICAL, 12);
  box.setMarginTop(24);
  box.setMarginBottom(24);
  box.setMarginStart(24);
  box.setMarginEnd(24);

  const label = new Label("Welcome to GTK with Deno!");
  const button = new Button("Click Me");

  button.connect("clicked", () => {
    label.setText("Button clicked!");
  });

  box.append(label);
  box.append(button);
  win.setChild(box);
  win.setProperty("visible", true);
});

app.run([]);
```

Run it:

```bash
deno run --allow-ffi my-app.ts
```

## License

MIT License - See LICENSE file for details
