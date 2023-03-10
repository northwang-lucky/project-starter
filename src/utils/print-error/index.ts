export function printErr(err: unknown): void;
export function printErr(err: string): void;
export function printErr(err: Error): void;
export function printErr(err: string | Error | unknown): void {
  console.error(`starter error: ${err instanceof Error ? err.message : err}`);
}
