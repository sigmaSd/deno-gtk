// Internal module for FFI library loading
// This file contains all dlopen calls and should not be part of the public API

import "./bun-deno-compat.ts";

// Detect OS and set library paths
const OS = Deno.build.os;

function getLibPath(libName: string, soversion: string): string {
  if (OS === "linux") {
    // Try to load library - system linker will handle version resolution
    // It searches in standard locations: /usr/lib, /usr/local/lib, LD_LIBRARY_PATH
    return `${libName}.so.${soversion}`;
  } else if (OS === "darwin") {
    // macOS uses .dylib and typically doesn't use version numbers in the same way
    return `${libName}.${soversion}.dylib`;
  } else if (OS === "windows") {
    // Windows uses .dll (GTK4 on Windows is uncommon but possible via MSYS2)
    const baseName = libName.replace("lib", "");
    return `${baseName}-${soversion}.dll`;
  }
  return `${libName}.so.${soversion}`;
}

const LIB_PATHS = {
  gtk: getLibPath("libgtk-4", "1"),
  adwaita: getLibPath("libadwaita-1", "0"),
  glib: getLibPath("libglib-2.0", "0"),
  gobject: getLibPath("libgobject-2.0", "0"),
  gio: getLibPath("libgio-2.0", "0"),
};

// Load GLib - Core utilities and main loop
export const glib = Deno.dlopen(LIB_PATHS.glib, {
  g_main_loop_new: { parameters: ["pointer", "bool"], result: "pointer" },
  g_main_loop_run: { parameters: ["pointer"], result: "void" },
  g_main_loop_quit: { parameters: ["pointer"], result: "void" },
  g_main_context_default: { parameters: [], result: "pointer" },
  g_main_context_pending: { parameters: ["pointer"], result: "bool" },
  g_main_context_iteration: {
    parameters: ["pointer", "bool"],
    result: "bool",
  },
  g_timeout_add: {
    parameters: ["u32", "function", "pointer"],
    result: "u32",
  },
  g_source_remove: { parameters: ["u32"], result: "bool" },
  g_free: { parameters: ["pointer"], result: "void" },
  g_strdup: { parameters: ["pointer"], result: "pointer" },
  g_malloc0: { parameters: ["usize"], result: "pointer" },
});

// Load GObject - Object system and type system
export const gobject = Deno.dlopen(LIB_PATHS.gobject, {
  g_object_new: {
    parameters: ["u64", "buffer"],
    result: "pointer",
    nonblocking: false,
  },
  g_object_ref: { parameters: ["pointer"], result: "pointer" },
  g_object_unref: { parameters: ["pointer"], result: "void" },
  g_object_set_property: {
    parameters: ["pointer", "buffer", "pointer"],
    result: "void",
  },
  g_object_get_property: {
    parameters: ["pointer", "buffer", "pointer"],
    result: "void",
  },
  g_signal_connect_data: {
    parameters: ["pointer", "buffer", "function", "pointer", "pointer", "u32"],
    result: "u64",
  },
  g_signal_handler_disconnect: {
    parameters: ["pointer", "u64"],
    result: "void",
  },
  g_type_from_name: { parameters: ["buffer"], result: "u64" },
  g_value_init: { parameters: ["pointer", "u64"], result: "pointer" },
  g_value_set_string: { parameters: ["pointer", "buffer"], result: "void" },
  g_value_set_boolean: { parameters: ["pointer", "bool"], result: "void" },
  g_value_set_int: { parameters: ["pointer", "i32"], result: "void" },
  g_value_set_uint: { parameters: ["pointer", "u32"], result: "void" },
  g_value_set_object: { parameters: ["pointer", "pointer"], result: "void" },
  g_value_get_string: { parameters: ["pointer"], result: "pointer" },
  g_value_get_boolean: { parameters: ["pointer"], result: "bool" },
  g_value_get_int: { parameters: ["pointer"], result: "i32" },
  g_value_get_uint: { parameters: ["pointer"], result: "u32" },
  g_value_get_object: { parameters: ["pointer"], result: "pointer" },
  g_value_unset: { parameters: ["pointer"], result: "void" },
});

// Load GIO - Application support and I/O
export const gio = Deno.dlopen(LIB_PATHS.gio, {
  g_application_run: {
    parameters: ["pointer", "i32", "pointer"],
    result: "i32",
  },
  g_application_quit: { parameters: ["pointer"], result: "void" },
  g_application_register: {
    parameters: ["pointer", "pointer", "pointer"],
    result: "bool",
  },
  g_application_activate: { parameters: ["pointer"], result: "void" },
  g_simple_action_new: {
    parameters: ["buffer", "pointer"],
    result: "pointer",
  },
  g_action_map_add_action: {
    parameters: ["pointer", "pointer"],
    result: "void",
  },
  g_menu_new: { parameters: [], result: "pointer" },
  g_menu_append: {
    parameters: ["pointer", "buffer", "buffer"],
    result: "void",
  },
  g_notification_new: { parameters: ["buffer"], result: "pointer" },
  g_notification_set_body: {
    parameters: ["pointer", "buffer"],
    result: "void",
  },
  g_application_send_notification: {
    parameters: ["pointer", "buffer", "pointer"],
    result: "void",
  },
  g_application_withdraw_notification: {
    parameters: ["pointer", "buffer"],
    result: "void",
  },
  g_list_store_new: { parameters: ["u64"], result: "pointer" },
  g_list_store_append: { parameters: ["pointer", "pointer"], result: "void" },
  g_task_propagate_pointer: {
    parameters: ["pointer", "pointer"],
    result: "pointer",
  },
});

// Load GTK4 - Widget toolkit
export const gtk = Deno.dlopen(LIB_PATHS.gtk, {
  gtk_init: { parameters: [], result: "void" },
  gtk_application_new: { parameters: ["buffer", "i32"], result: "pointer" },
  gtk_application_window_new: { parameters: ["pointer"], result: "pointer" },
  gtk_builder_new: { parameters: [], result: "pointer" },
  gtk_builder_add_from_file: {
    parameters: ["pointer", "buffer", "pointer"],
    result: "bool",
  },
  gtk_builder_add_from_string: {
    parameters: ["pointer", "buffer", "i64", "pointer"],
    result: "bool",
  },
  gtk_builder_get_object: {
    parameters: ["pointer", "buffer"],
    result: "pointer",
  },
  gtk_box_new: { parameters: ["i32", "i32"], result: "pointer" },
  gtk_box_append: { parameters: ["pointer", "pointer"], result: "void" },
  gtk_box_remove: { parameters: ["pointer", "pointer"], result: "void" },
  gtk_label_new: { parameters: ["buffer"], result: "pointer" },
  gtk_label_set_text: { parameters: ["pointer", "buffer"], result: "void" },
  gtk_label_get_text: { parameters: ["pointer"], result: "pointer" },
  gtk_label_set_markup: { parameters: ["pointer", "buffer"], result: "void" },
  gtk_label_set_use_markup: { parameters: ["pointer", "bool"], result: "void" },
  gtk_button_new_with_label: { parameters: ["buffer"], result: "pointer" },
  gtk_button_set_label: { parameters: ["pointer", "buffer"], result: "void" },
  gtk_window_set_title: { parameters: ["pointer", "buffer"], result: "void" },
  gtk_window_set_default_size: {
    parameters: ["pointer", "i32", "i32"],
    result: "void",
  },
  gtk_window_set_titlebar: {
    parameters: ["pointer", "pointer"],
    result: "void",
  },
  gtk_window_present: { parameters: ["pointer"], result: "void" },
  gtk_window_close: { parameters: ["pointer"], result: "void" },
  gtk_window_set_child: { parameters: ["pointer", "pointer"], result: "void" },
  gtk_window_get_child: { parameters: ["pointer"], result: "pointer" },
  gtk_scrolled_window_set_min_content_height: {
    parameters: ["pointer", "i32"],
    result: "void",
  },
  gtk_dialog_new: { parameters: [], result: "pointer" },
  gtk_window_set_transient_for: {
    parameters: ["pointer", "pointer"],
    result: "void",
  },
  gtk_window_set_modal: { parameters: ["pointer", "bool"], result: "void" },
  gtk_window_destroy: { parameters: ["pointer"], result: "void" },
  gtk_widget_set_margin_top: {
    parameters: ["pointer", "i32"],
    result: "void",
  },
  gtk_widget_set_margin_bottom: {
    parameters: ["pointer", "i32"],
    result: "void",
  },
  gtk_widget_set_margin_start: {
    parameters: ["pointer", "i32"],
    result: "void",
  },
  gtk_widget_set_margin_end: {
    parameters: ["pointer", "i32"],
    result: "void",
  },
  gtk_widget_set_halign: { parameters: ["pointer", "i32"], result: "void" },
  gtk_widget_set_valign: { parameters: ["pointer", "i32"], result: "void" },
  gtk_widget_set_hexpand: { parameters: ["pointer", "bool"], result: "void" },
  gtk_widget_set_vexpand: { parameters: ["pointer", "bool"], result: "void" },
  gtk_widget_set_visible: { parameters: ["pointer", "bool"], result: "void" },
  gtk_widget_get_visible: { parameters: ["pointer"], result: "bool" },
  gtk_widget_unparent: { parameters: ["pointer"], result: "void" },
  gtk_widget_get_first_child: { parameters: ["pointer"], result: "pointer" },
  gtk_widget_get_next_sibling: { parameters: ["pointer"], result: "pointer" },
  gtk_frame_new: { parameters: ["buffer"], result: "pointer" },
  gtk_frame_set_child: { parameters: ["pointer", "pointer"], result: "void" },
  gtk_scrolled_window_new: { parameters: [], result: "pointer" },
  gtk_scrolled_window_set_child: {
    parameters: ["pointer", "pointer"],
    result: "void",
  },
  gtk_list_box_new: { parameters: [], result: "pointer" },
  gtk_list_box_append: { parameters: ["pointer", "pointer"], result: "void" },
  gtk_list_box_remove: { parameters: ["pointer", "pointer"], result: "void" },
  gtk_list_box_set_selection_mode: {
    parameters: ["pointer", "i32"],
    result: "void",
  },
  gtk_list_box_select_row: {
    parameters: ["pointer", "pointer"],
    result: "void",
  },
  gtk_list_box_get_selected_row: { parameters: ["pointer"], result: "pointer" },
  gtk_list_box_row_new: { parameters: [], result: "pointer" },
  gtk_list_box_row_set_child: {
    parameters: ["pointer", "pointer"],
    result: "void",
  },
  gtk_string_list_new: { parameters: ["pointer"], result: "pointer" },
  gtk_string_list_append: { parameters: ["pointer", "buffer"], result: "void" },
  gtk_string_list_get_string: {
    parameters: ["pointer", "u32"],
    result: "pointer",
  },
  gtk_drop_down_new: {
    parameters: ["pointer", "pointer"],
    result: "pointer",
  },
  gtk_drop_down_get_selected: { parameters: ["pointer"], result: "u32" },
  gtk_drop_down_set_selected: {
    parameters: ["pointer", "u32"],
    result: "void",
  },
  gtk_entry_new: { parameters: [], result: "pointer" },
  gtk_editable_get_text: { parameters: ["pointer"], result: "pointer" },
  gtk_editable_set_text: { parameters: ["pointer", "buffer"], result: "void" },
  gtk_application_inhibit: {
    parameters: ["pointer", "pointer", "i32", "buffer"],
    result: "u32",
  },
  gtk_application_uninhibit: {
    parameters: ["pointer", "u32"],
    result: "void",
  },
  gtk_application_set_accels_for_action: {
    parameters: ["pointer", "buffer", "pointer"],
    result: "void",
  },
});

// Load Adwaita - GNOME-style widgets
export const adwaita = Deno.dlopen(LIB_PATHS.adwaita, {
  adw_init: { parameters: [], result: "void" },
  adw_application_new: { parameters: ["buffer", "i32"], result: "pointer" },
  adw_header_bar_new: { parameters: [], result: "pointer" },
  adw_header_bar_pack_end: {
    parameters: ["pointer", "pointer"],
    result: "void",
  },
  adw_header_bar_pack_start: {
    parameters: ["pointer", "pointer"],
    result: "void",
  },
  adw_about_dialog_new: { parameters: [], result: "pointer" },
  adw_about_dialog_set_application_name: {
    parameters: ["pointer", "buffer"],
    result: "void",
  },
  adw_about_dialog_set_version: {
    parameters: ["pointer", "buffer"],
    result: "void",
  },
  adw_about_dialog_set_developer_name: {
    parameters: ["pointer", "buffer"],
    result: "void",
  },
  adw_about_dialog_set_comments: {
    parameters: ["pointer", "buffer"],
    result: "void",
  },
  adw_toolbar_view_new: { parameters: [], result: "pointer" },
  adw_toolbar_view_set_content: {
    parameters: ["pointer", "pointer"],
    result: "void",
  },
  adw_toolbar_view_add_top_bar: {
    parameters: ["pointer", "pointer"],
    result: "void",
  },
  adw_style_manager_get_default: { parameters: [], result: "pointer" },
  adw_style_manager_set_color_scheme: {
    parameters: ["pointer", "i32"],
    result: "void",
  },
  adw_style_manager_get_color_scheme: {
    parameters: ["pointer"],
    result: "i32",
  },
  adw_preferences_window_new: { parameters: [], result: "pointer" },
  adw_preferences_window_add: {
    parameters: ["pointer", "pointer"],
    result: "void",
  },
  adw_preferences_page_new: { parameters: [], result: "pointer" },
  adw_preferences_page_add: {
    parameters: ["pointer", "pointer"],
    result: "void",
  },
  adw_preferences_group_new: { parameters: [], result: "pointer" },
  adw_preferences_group_add: {
    parameters: ["pointer", "pointer"],
    result: "void",
  },
  adw_message_dialog_new: {
    parameters: ["pointer", "buffer", "buffer"],
    result: "pointer",
  },
  adw_message_dialog_add_response: {
    parameters: ["pointer", "buffer", "buffer"],
    result: "void",
  },
  adw_message_dialog_set_response_appearance: {
    parameters: ["pointer", "buffer", "i32"],
    result: "void",
  },
  adw_message_dialog_set_default_response: {
    parameters: ["pointer", "buffer"],
    result: "void",
  },
  adw_message_dialog_set_close_response: {
    parameters: ["pointer", "buffer"],
    result: "void",
  },
  adw_message_dialog_choose: {
    parameters: ["pointer", "pointer", "function", "pointer"],
    result: "void",
  },
});
