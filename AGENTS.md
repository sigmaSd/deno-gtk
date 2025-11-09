# AGENTS.md - Project Context & Findings

## 2025-11-09

### Architecture Decisions

- **High-level wrapper philosophy**: The library provides TypeScript wrappers
  around GTK4/libadwaita FFI calls. User-facing code should never interact with
  raw pointers (`Deno.PointerValue`) or low-level FFI details.

- **Signal handling approach**: Instead of exposing raw FFI callback arguments,
  we provide type-safe helper methods like `onClick()`, `onRowActivated()`,
  `onSelectedChanged()`, etc. These methods convert raw pointers to proper
  wrapper objects and extract relevant data (like indices) before passing to
  callbacks.

- **GObject.ptr marked as internal**: While `ptr` needs to be public for
  internal use between classes, it's documented with `@internal` JSDoc to
  indicate it's not part of the public API.

### Key Improvements Made

1. **Enhanced GObject.connect()**: Updated to accept variable arguments from FFI
   callbacks and pass them to user callbacks, enabling higher-level wrappers to
   process them.

2. **Widget-specific signal helpers**:
   - `Button.onClick()` - Clean callback with no arguments
   - `ListBox.onRowActivated(row, index)` - Provides both row object and index
   - `DropDown.onSelectedChanged(index)` - Provides selected index directly
   - `Entry.onActivate()` and `onChanged()` - Simple event handlers
   - `Application.onActivate()`, `onShutdown()`, `onStartup()` - Lifecycle
     events
   - `Window.onCloseRequest()`, `onDestroy()` - Window lifecycle

3. **ListBoxRow.getIndex()**: Added proper GTK API to get row index instead of
   requiring pointer comparisons.

### Non-obvious Behaviors

- **Signal callback parameters**: GTK signal callbacks receive the object
  pointer as the first argument, followed by signal-specific arguments. The
  wrapper's `connect()` method needs to accept multiple pointer parameters even
  if not all are used.

- **Button constructor**: Made label optional (defaults to null) to support
  creating buttons without labels initially.

- **MessageDialog inheritance**: Fixed to extend `Window` (not `Widget`) since
  AdwMessageDialog extends GtkWindow.

### Key File Locations

- `/home/mrcool/dev/deno/gtk/src/gtk-ffi.ts` - Main wrapper classes (GObject,
  Widget, Application, all UI components)
- `/home/mrcool/dev/deno/gtk/src/libs.ts` - FFI library loading and symbol
  definitions
- `/home/mrcool/dev/deno/gtk/examples/widgets-demo.ts` - Comprehensive demo
  showing high-level API usage

### Current State

✅ Working:

- High-level signal connections for common widgets
- Type-safe callbacks without pointer exposure
- ListBox row activation with automatic index resolution
- All major GTK4 and Adwaita widgets wrapped

### Integration Points

- FFI symbols are defined in `libs.ts` and accessed via `gtk.symbols.*`,
  `gobject.symbols.*`, etc.
- All wrapper classes extend either `GObject` or one of its subclasses
  (`Widget`, `Window`, `Application`)
- The `connect()` method is the foundation for all signal handling, with
  convenience methods built on top
