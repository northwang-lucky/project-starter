import AdmZip from 'adm-zip';
import * as fs from 'fs-extra';
import { Octokit } from 'octokit';
import * as path from 'path';
import { parseConfig } from '../config';
import { error, printErr } from '../utils';
import { GetTemplatesRsp, Repo } from './types';

const [parseErr, { githubToken, org }] = parseConfig();
if (parseErr) {
  printErr(parseErr);
  process.exit();
}

const octokit = new Octokit({
  auth: githubToken,
});

export async function getTemplates(): Promise<GetTemplatesRsp> {
  try {
    const res = await octokit.rest.repos.listForOrg({ org });
    if (res.status !== 200) {
      const err = error(`Orgnaization information request failed! status: ${res.status}`);
      return [err, []];
    }

    const repos = res.data
      .filter(r => r.name !== 'project-starter')
      .map<Repo>(repo => {
        const { name, full_name: fullName } = repo;
        const [namespace, templateName] = name.split('-');
        return { name, fullName, tags: [namespace, templateName] };
      });

    return [null, repos];
  } catch (err) {
    return [error(err), []];
  }
}

export async function downloadRepo(fullName: string, projectName: string): Promise<[Error | null, string]> {
  try {
    const [owner, repo] = fullName.split('/');
    const res = await octokit.rest.repos.downloadZipballArchive({ owner, repo, ref: 'main' });
    if (![200, 302].includes(res.status)) {
      const err = error(`Download zip format archive failed!`);
      return [err, ''];
    }

    const workPath = process.cwd();
    const zipPath = path.resolve(workPath, `${projectName}.zip`);
    fs.createFileSync(zipPath);
    fs.writeFileSync(zipPath, new Uint8Array(res.data as ArrayBuffer));

    const zip = new AdmZip(zipPath);
    const dirName = zip.getEntries()?.[0].entryName;

    zip.extractAllTo(workPath);
    fs.removeSync(zipPath);

    const outputPath = path.resolve(workPath, projectName);
    fs.renameSync(path.resolve(workPath, dirName), outputPath);
    return [null, outputPath];
  } catch (err) {
    return [error(err), ''];
  }
}
