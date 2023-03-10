import * as fs from 'fs-extra';
import * as path from 'path';
import { error, getUserHome, printErr } from '../utils';
import { Config } from './types';

const configPath = path.resolve(getUserHome(), '.projectstaterrc');

let configCache = {} as Config;

export function hasConfig(): boolean {
  return fs.existsSync(configPath);
}

export function createConfig(config: Config): Error | null {
  try {
    if (hasConfig()) {
      fs.removeSync(configPath);
    }
    fs.createFileSync(configPath);
    fs.writeJsonSync(configPath, config, { spaces: 2 });
    return null;
  } catch (err) {
    printErr(err);
    return error(err);
  }
}

export function parseConfig(): [Error | null, Config] {
  try {
    if (!hasConfig()) {
      const msg = `Cannot find the config file whose name is ".projectstaterrc" in "${getUserHome()}".`;
      return [error(msg), configCache];
    }
    if (Object.keys(configCache).length === 0) {
      const config = fs.readJsonSync(configPath) as Config;
      configCache = { ...configCache, ...config };
    }
    return [null, configCache];
  } catch (err) {
    printErr(err);
    return [error(err), configCache];
  }
}

export function getConfig(): Config {
  return configCache;
}
