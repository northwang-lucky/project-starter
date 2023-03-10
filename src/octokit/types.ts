type Rsp<T> = [Error | null, T];

export type Namespace = string;
export type TemplateName = string;

export type Repo = {
  name: string;
  fullName: string;
  tags: [Namespace, TemplateName];
};

export type GetTemplatesRsp = Rsp<Repo[]>;
