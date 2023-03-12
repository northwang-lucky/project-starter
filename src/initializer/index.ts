import * as inquirer from 'inquirer';
import { createConfig, hasConfig } from '../config';
import { printErr, questionFactory } from '../utils';
import { InitializerAnswers } from './types';

export default async (): Promise<boolean> => {
  const configExisted = hasConfig();
  if (configExisted) {
    return true;
  }

  const questions = questionFactory<InitializerAnswers>(question => [
    question.list('needInitialize', {
      message: 'It seems that starter has not been initialized, would you like to initialize now?',
      choices: [
        { name: 'Yes', value: true },
        { name: 'No', value: false },
      ],
      when: !configExisted,
    }),
    question.input('org', {
      message: 'Please enter the name of orgnaization (which is saving your templates):',
      when: answers => answers.needInitialize,
    }),
    question.input('githubToken', {
      message: 'Please enter the github token that can fetch the meta data of the orgnaization:',
      when: answers => answers.needInitialize,
    }),
  ]);

  const { needInitialize: initialize, org, githubToken } = await inquirer.prompt(questions);
  if (!initialize) {
    console.log('Nothing happened.');
    return false;
  }

  const err = createConfig({ org, githubToken });
  if (err) {
    printErr(err);
    return false;
  }

  console.log('Initialize succeed!\n');
  return true;
};
