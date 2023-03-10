import * as fs from 'fs-extra';
import * as inquirer from 'inquirer';
import * as path from 'path';
import { Namespace, Repo } from '../../../octokit/types';
import { questionFactory } from '../../../question-factory';
import { error } from '../../../utils';
import { Create } from './types';

export function createRepoMap(repos: Repo[]): Map<Namespace, Create.RepoMapValue[]> {
  const repoMap = new Map<Namespace, Create.RepoMapValue[]>();
  repos.forEach(repo => {
    const {
      fullName,
      tags: [namespace, templateName],
    } = repo;

    const mapValues = repoMap.get(namespace);
    if (mapValues) {
      mapValues.push({ templateName, fullName });
      return;
    }
    repoMap.set(namespace, [{ templateName, fullName }]);
  });
  return repoMap;
}

export function ask(repoMap: Map<Namespace, Create.RepoMapValue[]>): Promise<Create.Answers> {
  const questions = questionFactory<Create.Answers>(question => [
    question.list('namespace', {
      message: 'Please select a namespace:',
      choices: Array.from(repoMap.keys()),
    }),
    question.list('templateIndex', {
      message: 'Please select a template:',
      choices: answers => {
        return (
          repoMap.get(answers.namespace)?.map((v, index) => ({
            name: v.templateName,
            value: index,
          })) || []
        );
      },
    }),
    question.input('description', {
      message: 'If you need, enter the description of the project:',
    }),
    question.list('useGit', {
      message: 'Would you like to initialize the project into a git repository?',
      choices: [
        { name: 'Yes', value: true },
        { name: 'No', value: false },
      ],
    }),
    question.input('remoteUrl', {
      message: 'If you need, enter the remote git repository http url:',
      when: answers => answers.useGit,
    }),
  ]);
  return inquirer.prompt(questions);
}

export function processFeTemplate(
  tplPath: string,
  { name, description: descirption = '', gitUrl }: Create.PkgInfo
): Error | null {
  try {
    const pkgJsonPath = path.resolve(tplPath, 'package.json');
    const rawPkgJson: Record<string, any> = fs.readJsonSync(pkgJsonPath);
    const pkgJson = {
      name,
      descirption,
      version: '0.0.0',
      ...(gitUrl
        ? {
            repository: {
              type: 'git',
              url: `git+${gitUrl}`,
            },
          }
        : {}),
      ...rawPkgJson,
    };
    fs.writeJsonSync(pkgJsonPath, pkgJson, { spaces: 2 });
    return null;
  } catch (err) {
    return error(err);
  }
}
