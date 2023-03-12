import fs from 'fs-extra';
import inquirer from 'inquirer';
import { findLicense, getLicense } from 'license';
import path from 'path';
import yaml from 'yaml';
import { error, printErr, questionFactory } from '../../../utils';
import * as tpl from './tpl';
import { Create } from './types';
import { getGitIgnore, getGitIgnoreLangs } from '../../../octokit';

export async function ask(): Promise<Create.Answers> {
  const questions = questionFactory<Create.Answers>(question => [
    question.list('namespace', {
      message: 'Please select a namespace:',
      choices: ['front-end', 'server-side'],
      default: 'front-end',
    }),
    question.list('template', {
      message: 'Please select a template:',
      choices: ({ namespace }) => {
        switch (namespace) {
          case 'front-end':
            return ['node', 'node-menorepo', 'github-action', 'nextjs'] as Create.Template.FrontEnd[];
          case 'sever-side':
            return ['kotlin-maven', 'kotlin-maven-multipart'] as Create.Template.ServerSide[];
          default:
            return [];
        }
      },
      default: 'node',
    }),
    question.input('description', {
      message: 'If you need, enter the description of the project:',
    }),
    question.input('author', {
      message: 'Please enter the author of the project:',
      validate: input => Boolean(input),
    }),
    question.searchList('license', {
      message: 'Please select a license:',
      choices: ['None', ...findLicense('')],
    }),
    question.list('useWorkflow', {
      message: 'Do you need a publish workflow?',
      choices: [
        { name: 'Yes', value: true },
        { name: 'No', value: false },
      ],
      default: true,
    }),
    question.list('useGit', {
      message: 'Would you like to initialize the project into a git repository?',
      choices: [
        { name: 'Yes', value: true },
        { name: 'No', value: false },
      ],
      default: true,
    }),
    question.searchList('gitIgnoreLang', {
      message: 'Please select a .gitignore template:',
      choices: async () => {
        const [err, langs] = await getGitIgnoreLangs();
        if (err) {
          printErr(err);
          process.exit();
        }
        return langs;
      },
      when: answers => answers.useGit,
    }),
    question.input('remoteUrl', {
      message: 'If you need, enter the remote git repository http url:',
      when: answers => answers.useGit,
    }),
  ]);
  return inquirer.prompt(questions);
}

export async function createFrondEndProject(
  template: Create.Template.FrontEnd,
  { name, description = '', author, license, useWorkflow, gitIgnoreLang, gitUrl }: Create.ProjectOptions
): Promise<[Error | null, string]> {
  const projectPath = path.resolve(process.cwd(), name);
  if (fs.existsSync(projectPath)) {
    return [error(`Directory "${name}" is already existed!`), ''];
  }

  try {
    fs.mkdirSync(projectPath);
  } catch (err) {
    return [error(err), ''];
  }

  const tasks = [
    // package.json
    new Promise<void>((resolve, reject) => {
      const content = {
        name,
        description,
        version: '0.0.0',
        ...(author ? { author } : {}),
        ...(gitUrl ? { repository: { type: 'git', url: `git+${gitUrl}` } } : {}),
        ...tpl.pkgJson,
      };
      const filepath = path.resolve(projectPath, 'package.json');
      try {
        fs.createFileSync(filepath);
        fs.writeJsonSync(filepath, content, { spaces: 2 });
        resolve();
      } catch (err) {
        reject(error(err));
      }
    }),
    // tsconfig.json
    new Promise<void>((resolve, reject) => {
      const content = tpl.tsconfigJson;
      const filepath = path.resolve(projectPath, 'tsconfig.json');
      try {
        fs.createFileSync(filepath);
        fs.writeJsonSync(filepath, content, { spaces: 2 });
        resolve();
      } catch (err) {
        reject(error(err));
      }
    }),
    // README.md
    new Promise<void>((resolve, reject) => {
      const content = `# ${name}\n`;
      const filepath = path.resolve(projectPath, 'README.md');
      try {
        fs.createFileSync(filepath);
        fs.writeFileSync(filepath, content);
        resolve();
      } catch (err) {
        reject(error(err));
      }
    }),
    // ? LICENSE
    license !== 'None' &&
      new Promise<void>((resolve, reject) => {
        const content = getLicense(license, {
          author,
          year: String(new Date().getFullYear()),
        });
        const filepath = path.resolve(projectPath, 'LICENSE');
        try {
          fs.createFileSync(filepath);
          fs.writeFileSync(filepath, `${content}\n`);
          resolve();
        } catch (err) {
          reject(error(err));
        }
      }),
    // ? action.yml
    template === 'github-action' &&
      new Promise<void>((resolve, reject) => {
        const content = yaml.stringify({ name, description, author, ...tpl.actionYml }, { nullStr: '' });
        const filepath = path.resolve(projectPath, 'action.yml');
        try {
          fs.createFileSync(filepath);
          fs.writeFileSync(filepath, content);
          resolve();
        } catch (err) {
          reject(error(err));
        }
      }),
    // .versionrc
    new Promise<void>((resolve, reject) => {
      const content = tpl.versionrc;
      const filepath = path.resolve(projectPath, '.versionrc');
      try {
        fs.createFileSync(filepath);
        fs.writeJsonSync(filepath, content, { spaces: 2 });
        resolve();
      } catch (err) {
        reject(error(err));
      }
    }),
    // .prettierrc.json
    new Promise<void>((resolve, reject) => {
      const content = tpl.prettierrcJson;
      const filepath = path.resolve(projectPath, '.prettierrc.json');
      try {
        fs.createFileSync(filepath);
        fs.writeJsonSync(filepath, content, { spaces: 2 });
        resolve();
      } catch (err) {
        reject(error(err));
      }
    }),
    // ? .gitignore
    !!gitIgnoreLang &&
      getGitIgnore(gitIgnoreLang).then(([reqErr, content]) => {
        if (reqErr) {
          return Promise.reject(error(reqErr));
        }
        const filepath = path.resolve(projectPath, '.gitignore');
        try {
          fs.createFileSync(filepath);
          fs.writeFileSync(filepath, `${content}\n# Custom\n.DS_Store\n.husky\nbin`);
          return Promise.resolve();
        } catch (err) {
          return Promise.reject(error(err));
        }
      }),
    // .eslintrc.json
    new Promise<void>((resolve, reject) => {
      const content = tpl.eslintrcJson;
      const filepath = path.resolve(projectPath, '.eslintrc.json');
      try {
        fs.createFileSync(filepath);
        fs.writeJsonSync(filepath, content, { spaces: 2 });
        resolve();
      } catch (err) {
        reject(error(err));
      }
    }),
    // .eslintignore
    new Promise<void>((resolve, reject) => {
      const content = [...tpl.eslintignore, ''].join('\n');
      const filepath = path.resolve(projectPath, '.eslintignore');
      try {
        fs.createFileSync(filepath);
        fs.writeFileSync(filepath, content);
        resolve();
      } catch (err) {
        reject(error(err));
      }
    }),
    // .czrc
    new Promise<void>((resolve, reject) => {
      const content = tpl.czrc;
      const filepath = path.resolve(projectPath, '.czrc');
      try {
        fs.createFileSync(filepath);
        fs.writeJsonSync(filepath, content, { spaces: 2 });
        resolve();
      } catch (err) {
        reject(error(err));
      }
    }),
    // .commitlintrc.json
    new Promise<void>((resolve, reject) => {
      const content = tpl.commitlintrcJson;
      const filepath = path.resolve(projectPath, '.commitlintrc.json');
      try {
        fs.createFileSync(filepath);
        fs.writeJsonSync(filepath, content, { spaces: 2 });
        resolve();
      } catch (err) {
        reject(error(err));
      }
    }),
    // src/index.ts
    (['node', 'github-action'] as Create.Template.FrontEnd[]).includes(template) &&
      new Promise<void>((resolve, reject) => {
        const content = "console.log('Hello World');\n";
        const srcPath = path.resolve(projectPath, 'src');
        const filepath = path.resolve(srcPath, 'index.ts');
        try {
          fs.mkdirSync(srcPath);
          fs.createFileSync(filepath);
          fs.writeFileSync(filepath, content);
          resolve();
        } catch (err) {
          reject(error(err));
        }
      }),
    // ? scripts/build-tip.js & scripts/start.js
    template === 'github-action' &&
      new Promise<void>((resolve, reject) => {
        const scriptsPath = path.resolve(projectPath, 'scripts');
        try {
          fs.mkdirSync(scriptsPath);
        } catch (err) {
          reject(error(err));
          return;
        }

        const buildTipJsTask = new Promise<void>(($resolve, $reject) => {
          const buildTipJsPath = path.resolve(scriptsPath, 'build-tip.js');
          try {
            const buildTipJs = fs.readFileSync(path.resolve(__dirname, 'tpl/action-scripts/build-tip.js'));
            fs.createFileSync(buildTipJsPath);
            fs.writeFileSync(buildTipJsPath, buildTipJs);
            $resolve();
          } catch (err) {
            $reject(error(err));
          }
        });

        const startJsTask = new Promise<void>(($resolve, $reject) => {
          const startJsPath = path.resolve(scriptsPath, 'start.js');
          try {
            const startJs = fs.readFileSync(path.resolve(__dirname, 'tpl/action-scripts/start.js'));
            fs.createFileSync(startJsPath);
            fs.writeFileSync(startJsPath, startJs);
            $resolve();
          } catch (err) {
            $reject(error(err));
          }
        });

        Promise.all([buildTipJsTask, startJsTask])
          .then(() => resolve())
          .catch(err => reject(err));
      }),
    // ? .template
    useWorkflow &&
      new Promise<void>((resolve, reject) => {
        const content = tpl.larkMessageCardJson;
        const templatePath = path.resolve(projectPath, '.template');
        const filepath = path.resolve(templatePath, 'lark-message-card.json');
        try {
          fs.mkdirSync(templatePath);
          fs.createFileSync(filepath);
          fs.writeJsonSync(filepath, content, { spaces: 2 });
          resolve();
        } catch (err) {
          reject(error(err));
        }
      }),
    // ? .gihub/workflows/publish.yml
    useWorkflow &&
      new Promise<void>((resolve, reject) => {
        const workflowsPath = path.resolve(projectPath, '.github/workflows');
        const filepath = path.resolve(workflowsPath, 'publish.yml');
        try {
          const content = yaml.stringify(tpl.publishYml, { nullStr: '' });
          fs.mkdirSync(workflowsPath, { recursive: true });
          fs.createFileSync(filepath);
          fs.writeFileSync(filepath, `${content}\n`);
          resolve();
        } catch (err) {
          reject(error(err));
        }
      }),
  ].filter((task): task is Promise<void> => Boolean(task));

  try {
    await Promise.all(tasks);
    return [null, projectPath];
  } catch (err) {
    fs.removeSync(projectPath);
    return [error(err), projectPath];
  }
}
