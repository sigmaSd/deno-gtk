// deno-lint-ignore-file
// @ts-nocheck Remove this when editing this file to get type checks, its just here to make deno check happy
/**
 * Deno compatibility layer for Bun
 * This module provides Deno APIs implemented using Bun's FFI equivalents
 */

import process from "node:process";
if (navigator.userAgent.startsWith("Bun")) {
  const { dlopen, FFIType, CString, ptr, JSCallback } = await import("bun:ffi");
  const { type } = await import("node:os");

  class DenoCompat {
    static env = {
      get(name: string) {
        return Bun.env[name];
      },
    };

    static build = {
      os: (() => {
        const osType = type().toLowerCase();
        if (osType === "linux") return "linux";
        if (osType === "darwin") return "darwin";
        if (osType === "windows_nt") return "windows";
        return osType;
      })(),
    };

    static exit(code?: number) {
      process.exit(code);
    }

    static transformFFIType(denoType: string) {
      switch (denoType) {
        case "void":
          return FFIType.void;
        case "bool":
          return FFIType.bool;
        case "u8":
          return FFIType.u8;
        case "i8":
          return FFIType.i8;
        case "u16":
          return FFIType.u16;
        case "i16":
          return FFIType.i16;
        case "u32":
          return FFIType.u32;
        case "i32":
          return FFIType.i32;
        case "u64":
          return FFIType.u64;
        case "i64":
          return FFIType.i64;
        case "usize":
          return FFIType.u64;
        case "isize":
          return FFIType.i64;
        case "f32":
          return FFIType.f32;
        case "f64":
          return FFIType.f64;
        case "pointer":
        case "buffer":
          return FFIType.ptr;
        case "function":
          return FFIType.function;
        default:
          throw new Error(`FFI type not supported: ${denoType}`);
      }
    }

    static dlopen(path: string, symbols: Record<string, any>) {
      const bunSymbols: Record<string, any> = {};

      for (const name in symbols) {
        const symbol = symbols[name];
        if ("type" in symbol) {
          throw new Error("Symbol type notation not supported");
        } else {
          bunSymbols[name] = {
            args: symbol.parameters.map((type: string) =>
              this.transformFFIType(type)
            ),
            returns: this.transformFFIType(symbol.result),
          };
        }
      }

      const lib = dlopen(path, bunSymbols);
      return lib;
    }

    static UnsafeCallback = class UnsafeCallback {
      inner: any;
      pointer: any;

      constructor(def: any, fn: any) {
        this.inner = new JSCallback(fn, {
          args: def.parameters.map((type: string) =>
            DenoCompat.transformFFIType(type)
          ),
          returns: DenoCompat.transformFFIType(def.result),
        });
        this.pointer = this.inner.ptr;
      }

      close() {
        this.inner.close();
      }
    };

    static UnsafePointerView = class UnsafePointerView {
      static getCString(pointer: any) {
        return new CString(pointer);
      }

      constructor(public ptr: any) {}

      getCString() {
        return new CString(this.ptr);
      }
    };

    static UnsafePointer = class UnsafePointer {
      static equals(a: any, b: any) {
        return a === b;
      }

      static create(value: bigint | number) {
        return Number(value);
      }

      static of(buffer: ArrayBuffer | TypedArray) {
        return ptr(buffer);
      }

      static value(pointer: any) {
        return pointer;
      }
    };
  }

  (globalThis as any).Deno = DenoCompat;
}

export {};
