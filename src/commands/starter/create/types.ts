export namespace Create {
  export type Namespace = 'front-end' | 'sever-side';

  export namespace Template {
    export type FrontEnd = 'node' | 'node-menorepo' | 'github-action' | 'nextjs';
    export type ServerSide = 'kotlin-maven' | 'kotlin-maven-multipart';
  }

  export type Answers = {
    namespace: Namespace;
    template: Template.FrontEnd | Template.ServerSide;
    description?: string;
    author: string;
    license: string;
    useWorkflow: boolean;
    useGit: boolean;
    gitIgnoreLang?: string;
    remoteUrl?: string;
  };

  export type ProjectOptions = {
    name: string;
    description?: string;
    author: string;
    license: string;
    useWorkflow: boolean;
    gitIgnoreLang?: string;
    gitUrl?: string;
  };
}
