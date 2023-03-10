import * as sh from 'shelljs';
import { getConfig } from '../../../config';
import { downloadRepo, getTemplates } from '../../../octokit';
import { SubCommand } from '../../../types';
import { loading, printErr } from '../../../utils';
import { ask, createRepoMap, processFeTemplate } from './fn';

const $create: SubCommand = {
  install: program => {
    program
      .command('create')
      .description('create a project')
      .argument('<project-name>', 'your project name')
      .action(async (projectName: string) => {
        if (!projectName) {
          printErr('project-name is required! e.g. `starter create node-demo`');
          return;
        }

        const { org } = getConfig();
        loading.start(`Fetching templates from ${org}...`);
        const [fetchErr, repos] = await getTemplates();
        loading.stop();
        if (fetchErr) {
          printErr(fetchErr);
          return;
        }

        const repoMap = createRepoMap(repos);
        const { namespace, templateIndex, description, useGit, remoteUrl } = await ask(repoMap);

        const target = repoMap.get(namespace)?.[templateIndex];
        if (!target) {
          printErr(`Cannnot find the target template! namespace: ${namespace}, index: ${templateIndex}`);
          return;
        }

        loading.start(`Downloading template from ${target.fullName}...`);
        const [downloadErr, outputPath] = await downloadRepo(target.fullName, projectName);
        loading.stop();
        if (downloadErr) {
          printErr(downloadErr);
          return;
        }

        switch (namespace) {
          case 'fe':
            processFeTemplate(outputPath, { name: projectName, description, gitUrl: remoteUrl });
            break;
          default:
        }

        if (useGit) {
          const rst = sh.exec(`cd ${outputPath} && git init ---initial-branch main`);
          if (rst.code !== 0) {
            printErr(rst.stderr);
            return;
          }
        }

        console.log(`\nSucceed! Run \`cd ${projectName}\` and do anything you want to do!`);
      });
  },
};

export default $create;
