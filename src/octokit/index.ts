import { Octokit } from 'octokit';
import { error } from '../utils';

const octokit = new Octokit();

export async function getGitIgnoreLangs(): Promise<[Error | null, string[]]> {
  try {
    const res = await octokit.rest.gitignore.getAllTemplates();
    if (res.status !== 200) {
      const err = error(`Fetch all .gitignore templates failed! status: ${res.status}`);
      return [error(err), []];
    }
    return [null, res.data];
  } catch (err) {
    return [error(err), []];
  }
}

export async function getGitIgnore(lang: string): Promise<[Error | null, string]> {
  try {
    const res = await octokit.rest.gitignore.getTemplate({ name: lang });
    if (res.status !== 200) {
      const err = error(`Fetch ${lang} .gitignore template failed!`);
      return [err, ''];
    }
    return [null, res.data.source];
  } catch (err) {
    return [error(err), ''];
  }
}
