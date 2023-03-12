import * as sh from 'shelljs';
import { SubCommand } from '../../../types';
import { loading, printErr } from '../../../utils';
import { ask, createFrondEndProject } from './fn';
import { Create } from './types';

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

        const {
          namespace,
          template,
          description,
          author,
          license,
          useWorkflow,
          useGit,
          gitIgnoreLang,
          remoteUrl,
          runInstall,
        } = await ask();

        let outputPath: string;
        if (namespace === 'front-end') {
          const [err, projectPath] = await createFrondEndProject(template as Create.Template.FrontEnd, {
            name: projectName,
            description,
            author,
            license,
            useWorkflow,
            gitIgnoreLang,
            gitUrl: remoteUrl,
          });
          if (err) {
            printErr(err);
            return;
          }
          outputPath = projectPath;
        } else {
          printErr(`Invalid namespace "${namespace}"`);
          return;
        }

        if (useGit) {
          let rst = sh.exec(`cd ${outputPath} && git init`, { silent: true });
          if (rst.code !== 0) {
            printErr(rst.stderr);
            return;
          }

          rst = sh.exec(`cd ${outputPath} && git branch --show-current`, { silent: true });
          if (rst.code !== 0) {
            printErr(rst.stderr);
            return;
          }

          // Use a speical way to modify the default branch from master to main
          const current = rst.stdout;
          if (current !== 'main') {
            rst = sh.exec(`cd ${outputPath} && git add . && git checkout -b main && git rm -r --cached .`, {
              silent: true,
            });
            if (rst.code !== 0) {
              printErr(rst.stderr);
              return;
            }
          }
        }

        if (remoteUrl) {
          const rst = sh.exec(`cd ${outputPath} && git remote add origin ${remoteUrl}`);
          if (rst.code !== 0) {
            printErr(rst.stderr);
            return;
          }
        }

        if (runInstall) {
          loading.start('Installing dependencies...');
          const rst = sh.exec(`cd ${outputPath} && pnpm install`, { silent: true });
          loading.stop();
          if (rst.code !== 0) {
            printErr(rst.stderr);
            return;
          }
        }

        console.log(`\nSucceed!\nRun \`cd ${projectName}\` and do anything you want to do!`);
      });
  },
};

export default $create;
