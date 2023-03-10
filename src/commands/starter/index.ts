#!/usr/bin/env node
(async () => {
  const { getPackageJson, printErr } = await import('../../utils');
  const { default: init } = await import('../../initializer');

  const __continue__ = await init();
  if (!__continue__) {
    return;
  }

  const { program } = await import('commander');
  const { default: $create } = await import('./create');

  const packageJson = getPackageJson();
  if (!packageJson) {
    printErr("Parse package.json failed! It's not a validated json.");
    process.exit();
  }

  const { description, version } = packageJson;
  program.name('starter').description(description).version(version);
  $create.install(program);
  program.parse();
})();
