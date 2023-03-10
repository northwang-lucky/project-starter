import { Namespace, TemplateName } from '../../../octokit/types';

export namespace Create {
  export type RepoMapValue = {
    templateName: TemplateName;
    fullName: string;
  };
  export type Answers = {
    namespace: Namespace;
    templateIndex: number;
    description: string;
    useGit: boolean;
    remoteUrl: string;
  };

  export type PkgInfo = {
    name: string;
    description?: string;
    gitUrl?: string;
  };
}
