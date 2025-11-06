#!/usr/bin/env -S deno run --allow-ffi

import {
  Application,
  ApplicationWindow,
  Box,
  Button,
  DropDown,
  Entry,
  Frame,
  GTK_ORIENTATION_HORIZONTAL,
  GTK_ORIENTATION_VERTICAL,
  HeaderBar,
  Label,
  ListBox,
  ListBoxRow,
  ScrolledWindow,
  StringList,
  ToolbarView,
  type Widget,
} from "@sigmasd/gtk";

const APP_ID = "com.example.WidgetsDemo";
const APP_FLAGS = 0;

class WidgetsDemoWindow {
  #app: Application;
  #win: ApplicationWindow;
  #counter = 0;
  #outputLabel: Label;

  constructor(app: Application) {
    this.#app = app;
    this.#win = new ApplicationWindow(app);
    this.#win.setTitle("GTK Widgets Demo");
    this.#win.setDefaultSize(800, 600);

    // Create output label for displaying interactions
    this.#outputLabel = new Label("Welcome! Interact with the widgets below.");
    this.#outputLabel.setProperty("wrap", true);
    this.#outputLabel.setProperty("xalign", 0);

    this.#buildUI();
  }

  #buildUI() {
    // Create toolbar with header bar
    const toolbarView = new ToolbarView();
    const headerBar = new HeaderBar();
    toolbarView.addTopBar(headerBar);

    // Main container (vertical box)
    const mainBox = new Box(GTK_ORIENTATION_VERTICAL, 12);
    mainBox.setMarginTop(12);
    mainBox.setMarginBottom(12);
    mainBox.setMarginStart(12);
    mainBox.setMarginEnd(12);

    // Output label at top
    const outputFrame = new Frame("Status");
    outputFrame.setChild(this.#outputLabel);
    this.#outputLabel.setMarginTop(8);
    this.#outputLabel.setMarginBottom(8);
    this.#outputLabel.setMarginStart(8);
    this.#outputLabel.setMarginEnd(8);
    mainBox.append(outputFrame);

    // Create scrolled window for content
    const scrolled = new ScrolledWindow();
    scrolled.setProperty("vexpand", true);
    scrolled.setProperty("hexpand", true);

    // Content box
    const contentBox = new Box(GTK_ORIENTATION_VERTICAL, 12);
    contentBox.setMarginTop(12);
    contentBox.setMarginBottom(12);
    contentBox.setMarginStart(12);
    contentBox.setMarginEnd(12);

    // Section 1: Buttons
    contentBox.append(this.#createButtonSection());

    // Section 2: Text Entry
    contentBox.append(this.#createEntrySection());

    // Section 3: Dropdown
    contentBox.append(this.#createDropdownSection());

    // Section 4: List Box
    contentBox.append(this.#createListBoxSection());

    scrolled.setChild(contentBox);
    mainBox.append(scrolled);

    toolbarView.setContent(mainBox);
    this.#win.setChild(toolbarView);
  }

  #createButtonSection(): Widget {
    const frame = new Frame("Buttons");
    const box = new Box(GTK_ORIENTATION_HORIZONTAL, 8);
    box.setMarginTop(8);
    box.setMarginBottom(8);
    box.setMarginStart(8);
    box.setMarginEnd(8);

    const button1 = new Button("Click Me!");
    button1.connect("clicked", () => {
      this.#counter++;
      this.#updateOutput(`Button clicked! Count: ${this.#counter}`);
    });

    const button2 = new Button("Reset Counter");
    button2.connect("clicked", () => {
      this.#counter = 0;
      this.#updateOutput("Counter reset to 0");
    });

    const button3 = new Button("Say Hello");
    button3.connect("clicked", () => {
      this.#updateOutput("Hello from GTK! 👋");
    });

    box.append(button1);
    box.append(button2);
    box.append(button3);
    frame.setChild(box);

    return frame;
  }

  #createEntrySection(): Widget {
    const frame = new Frame("Text Entry");
    const box = new Box(GTK_ORIENTATION_HORIZONTAL, 8);
    box.setMarginTop(8);
    box.setMarginBottom(8);
    box.setMarginStart(8);
    box.setMarginEnd(8);

    const entry = new Entry();
    entry.setProperty("placeholder-text", "Type something here...");
    entry.setProperty("hexpand", true);

    const submitButton = new Button("Submit");
    submitButton.connect("clicked", () => {
      const text = entry.getText();
      if (text) {
        this.#updateOutput(`You entered: "${text}"`);
      } else {
        this.#updateOutput("Entry is empty!");
      }
    });

    const clearButton = new Button("Clear");
    clearButton.connect("clicked", () => {
      entry.setText("");
      this.#updateOutput("Entry cleared");
    });

    box.append(entry);
    box.append(submitButton);
    box.append(clearButton);
    frame.setChild(box);

    return frame;
  }

  #createDropdownSection(): Widget {
    const frame = new Frame("Dropdown Selection");
    const box = new Box(GTK_ORIENTATION_HORIZONTAL, 8);
    box.setMarginTop(8);
    box.setMarginBottom(8);
    box.setMarginStart(8);
    box.setMarginEnd(8);

    const label = new Label("Choose a color:");
    label.setMarginEnd(8);

    const stringList = new StringList();
    const colors = ["Red", "Green", "Blue", "Yellow", "Purple", "Orange"];
    for (const color of colors) {
      stringList.append(color);
    }

    const dropdown = new DropDown(stringList);
    dropdown.setProperty("hexpand", true);

    dropdown.connect("notify::selected", () => {
      const selected = dropdown.getSelected();
      const color = colors[selected];
      this.#updateOutput(`Selected color: ${color} (index: ${selected})`);
    });

    box.append(label);
    box.append(dropdown);
    frame.setChild(box);

    return frame;
  }

  #createListBoxSection(): Widget {
    const frame = new Frame("List Box");
    const outerBox = new Box(GTK_ORIENTATION_VERTICAL, 8);
    outerBox.setMarginTop(8);
    outerBox.setMarginBottom(8);
    outerBox.setMarginStart(8);
    outerBox.setMarginEnd(8);

    const listBox = new ListBox();
    listBox.setProperty("selection-mode", 1); // GTK_SELECTION_SINGLE

    const items = [
      "📚 Documentation",
      "🔧 Settings",
      "🎨 Appearance",
      "🔔 Notifications",
      "🔒 Privacy",
      "ℹ️ About",
    ];

    // Store rows for later reference
    const rows: ListBoxRow[] = [];

    for (const item of items) {
      const row = new ListBoxRow();
      const label = new Label(item);
      label.setProperty("xalign", 0);
      label.setMarginTop(12);
      label.setMarginBottom(12);
      label.setMarginStart(12);
      label.setMarginEnd(12);
      row.setChild(label);
      listBox.append(row);
      rows.push(row);
    }

    listBox.connect("row-activated", (...args: unknown[]) => {
      const rowPtr = args[1] as Deno.PointerValue;
      // Find which row was activated
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].ptr === rowPtr) {
          this.#updateOutput(`List item activated: ${items[i]}`);
          break;
        }
      }
    });

    const scrolled = new ScrolledWindow();
    scrolled.setMinContentHeight(200);
    scrolled.setChild(listBox);

    outerBox.append(scrolled);
    frame.setChild(outerBox);

    return frame;
  }

  #updateOutput(message: string) {
    console.log(`[OUTPUT] ${message}`);
    this.#outputLabel.setText(message);
  }

  present() {
    this.#win.setProperty("visible", true);
  }
}

class WidgetsDemoApp {
  #app: Application;
  #win?: WidgetsDemoWindow;

  constructor() {
    this.#app = new Application(APP_ID, APP_FLAGS);

    this.#app.connect("activate", () => {
      console.log("Application activated");
      if (!this.#win) {
        this.#win = new WidgetsDemoWindow(this.#app);
        this.#win.present();
      }
    });
  }

  run(): number {
    console.log("Starting GTK Widgets Demo Application");
    const result = this.#app.run([]);
    console.log(`Application exited with code: ${result}`);
    return result;
  }
}

// Main entry point
if (import.meta.main) {
  const app = new WidgetsDemoApp();
  const exitCode = app.run();
  Deno.exit(exitCode);
}
