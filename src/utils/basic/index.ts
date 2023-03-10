import * as fs from 'fs-extra';
import * as path from 'path';
import { printErr } from '../print-error';

const packageJson = fs.readFileSync(path.resolve(__dirname, '../../../package.json'), {
  encoding: 'utf-8',
});

const USER_HOME = process.env.HOME || process.env.USERPROFILE;
if (!USER_HOME) {
  printErr('Cannot find the user directory!');
  process.exit();
}

export function getPackageJson(): Record<string, any> | null {
  try {
    return JSON.parse(packageJson);
  } catch (err) {
    return null;
  }
}

export function error(err?: any): Error {
  if (err instanceof Error) {
    return err;
  }
  if (typeof err === 'undefined') {
    return new Error();
  }
  return new Error(String(err));
}

export function getUserHome(): string {
  return USER_HOME as string;
}
