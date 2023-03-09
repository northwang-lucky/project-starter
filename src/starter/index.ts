#!/usr/bin/env node
import { program } from 'commander';
import { getPackageJson, printErr } from '../utils';

const packageJson = getPackageJson();
if (!packageJson) {
  printErr("Parse package.json failed! It's not a validated json.");
  process.exit();
}

const { description, version } = packageJson;
program.name('starter').description(description).version(version);

program.parse();
