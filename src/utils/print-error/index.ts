export function printErr(err: string): void;
export function printErr(err: Error): void;
export function printErr(err: string | Error): void {
  console.error(`starter error: ${err instanceof Error ? err.message : err}`);
}
