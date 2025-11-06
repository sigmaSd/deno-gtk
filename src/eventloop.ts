/**
 * Event loop integration for GTK applications with async/await support.
 *
 * This module provides the `EventLoop` class which integrates GLib's MainContext
 * with Deno/Bub's event loop, enabling the use of async/await, Promises, fetch(),
 * setTimeout(), and other async JavaScript APIs within GTK applications.
 *
 * By default, GTK's `app.run()` blocks JavaScript's event loop. The EventLoop
 * class solves this by intelligently processing GLib events using a hybrid approach:
 * microtasks for sub-millisecond latency when events are active, and sleeping
 * when idle to conserve CPU.
 *
 * @example
 * ```typescript
 * import { Application } from "@sigmasd/gtk";
 * import { EventLoop } from "@sigmasd/gtk/eventloop";
 *
 * const app = new Application("com.example.App", 0);
 * const eventLoop = new EventLoop();
 *
 * app.connect("activate", async () => {
 *   // Now you can use async/await!
 *   const response = await fetch("https://api.example.com");
 *   const data = await response.json();
 * });
 *
 * await eventLoop.start(app);
 * ```
 *
 * @module
 */

import type { Application } from "./gtk-ffi.ts";
import { glib } from "./libs.ts";

export interface EventLoopOptions {
  /**
   * Maximum sleep interval in milliseconds when no events are pending.
   * When events are actively being processed, the loop will check again
   * immediately using microtasks for sub-millisecond latency.
   * @default 16
   */
  pollInterval?: number;
}

/**
 * Event loop that integrates GLib's MainContext with Javascript's event loop.
 *
 * By default, using `app.run()` blocks Javascript's event loop because GLib's MainContext
 * takes control of the main thread. This event loop provides a workaround by
 * intelligently processing GLib events: using microtasks for immediate response
 * when events are flowing, and sleeping to conserve CPU when idle.
 */
export class EventLoop {
  #isRunning = false;
  readonly #pollInterval: number;
  #app?: Application;
  #mainContextPtr: Deno.PointerValue;

  constructor(options: EventLoopOptions = {}) {
    this.#pollInterval = options.pollInterval ?? 16;
    this.#mainContextPtr = glib.symbols.g_main_context_default();
  }

  /**
   * Starts the event loop.
   * Uses a hybrid approach: sub-millisecond latency when events are active,
   * and sleeps when idle to conserve CPU.
   */
  async start(app?: Application): Promise<void> {
    if (this.#isRunning) {
      return;
    }

    this.#app = app;
    this.#app?.register();
    this.#app?.activate();
    this.#isRunning = true;

    // Hybrid event loop: fast when busy, efficient when idle
    while (this.#isRunning) {
      // Check if there are pending events before processing
      const hadEvents = glib.symbols.g_main_context_pending(
        this.#mainContextPtr,
      );

      // Process all currently pending events
      while (glib.symbols.g_main_context_pending(this.#mainContextPtr)) {
        glib.symbols.g_main_context_iteration(this.#mainContextPtr, false);
      }

      // Adapt sleep strategy based on event activity
      if (hadEvents) {
        // Events were processed - check again immediately with minimal delay
        // This gives sub-millisecond response time during active periods
        await new Promise((resolve) =>
          queueMicrotask(() => resolve(undefined))
        );
      } else {
        // No events - sleep for the full interval to save CPU
        await new Promise((resolve) => setTimeout(resolve, this.#pollInterval));
      }
    }
  }

  /**
   * Stops the event loop.
   * This will stop processing GLib events and exit the event loop.
   */
  stop(): void {
    if (!this.#isRunning) {
      return;
    }
    if (this.#app) {
      this.#app.quit();
    }
    this.#isRunning = false;
  }

  /**
   * Returns whether the event loop is currently running.
   */
  get isRunning(): boolean {
    return this.#isRunning;
  }

  /**
   * Returns the current poll interval in milliseconds.
   */
  get pollInterval(): number {
    return this.#pollInterval;
  }
}
