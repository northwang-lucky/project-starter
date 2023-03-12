/* eslint-disable no-template-curly-in-string */
export const pkgJson = {
  packageManager: 'pnpm@7.1.0',
  scripts: {
    prepare: 'pnpm husky:install',
    build: 'echo "Error: no build specified" && exit 1',
    ver: 'standard-version',
    commit: 'cz',
    'commit:lint': 'commitlint --edit',
    'husky:install': 'rimraf ./.husky && husky install && pnpm husky:pre-commit-hook && pnpm husky:commit-msg-hook',
    'husky:pre-commit-hook': 'husky add .husky/pre-commit "pnpm lint-staged"',
    'husky:commit-msg-hook': 'husky add .husky/commit-msg "pnpm commit:lint"',
    'lint-staged': 'lint-staged',
    'lint-staged:format': 'prettier -w',
    'lint-staged:eslint': 'eslint',
  },
  devDependencies: {
    '@commitlint/cli': '17.4.2',
    '@commitlint/config-conventional': '17.4.2',
    '@types/node': '14.14.31',
    commitizen: '4.3.0',
    'cz-conventional-changelog': '3.3.0',
    eslint: '8.22.0',
    'eslint-config-airbnb-typescript-prettier': '5.0.0',
    husky: '8.0.3',
    'lint-staged': '13.1.0',
    prettier: '2.5.1',
    rimraf: '4.1.2',
    'standard-version': '9.5.0',
    typescript: '4.4.4',
  },
};

export const tsconfigJson = {
  compilerOptions: {
    target: 'es6',
    module: 'commonjs',
    outDir: 'dist',
    rootDir: 'src',
    strict: true,
    noImplicitAny: true,
    esModuleInterop: true,
  },
  include: ['src'],
  exclude: ['node_modules'],
};

export const actionYml = {
  branding: {
    icon: null,
    color: 'blue',
  },
  inputs: null,
  runs: {
    using: 'node16',
    main: 'lib/index.js',
  },
};

export const versionrc = {
  scripts: {
    postchangelog: 'prettier -w ./CHANGELOG.md',
  },
};

export const prettierrcJson = {
  printWidth: 120,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  useTabs: false,
  tabWidth: 2,
  trailingComma: 'es5',
  semi: true,
  singleQuote: true,
};

export const eslintrcJson = {
  extends: ['airbnb-typescript-prettier'],
  rules: {
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/explicit-function-return-type': [
      'error',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
      },
    ],
    '@typescript-eslint/member-ordering': 'error',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-this-alias': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-var-requires': 'off',
    'func-names': 'off',
    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': 'off',
    'no-console': 'off',
    'no-extend-native': 'off',
    'no-param-reassign': 'off',
    'no-plusplus': 'off',
    'no-underscore-dangle': 'off',
    'no-void': 'off',
    'prefer-object-spread': 'off',
    'prefer-spread': 'off',
    'react/function-component-definition': 'off',
    'react-hooks/rules-of-hooks': 'off',
  },
};

export const eslintignore = ['bin', 'lib', 'dist'];

export const czrc = {
  path: 'cz-conventional-changelog',
};

export const commitlintrcJson = {
  extends: ['@commitlint/config-conventional'],
};

export const larkMessageCardJson = {
  msg_type: 'interactive',
  card: {
    header: {
      template: '${header_color}',
      title: { tag: 'plain_text', content: '${header_title}' },
    },
    elements: [
      {
        tag: 'markdown',
        content: '**[Repository]:** ${repository}\\n**[Workflow]:** ${workflow}',
      },
      { tag: 'hr' },
      {
        tag: 'action',
        actions: [
          {
            tag: 'button',
            text: { tag: 'plain_text', content: 'Show More' },
            type: 'primary',
            url: '${workflow_url}',
          },
        ],
      },
    ],
  },
};

export const publishYml = {
  name: 'Publish',
  on: {
    workflow_dispatch: null,
    push: { tags: ['v**'] },
  },
  env: {
    APP_NAME: 'Lark',
    WORKFLOW_URL: 'https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}',
  },
  jobs: {
    'notify-start': {
      'runs-on': 'ubuntu-latest',
      name: 'Report Start',
      steps: [
        {
          name: 'Notify Start',
          uses: 'northwang-lucky/chatbot-webhook-client@v1.1.1',
          with: {
            app: '${{ env.APP_NAME }}',
            webhook: '${{ secrets.CUSTOM_BOT_WEBHOOK }}',
            secret: '${{ secrets.CUSTOM_BOT_SECRET }}',
            'github-token': '${{ secrets.GITHUB_TOKEN }}',
            template: 'file://.template/lark-message-card.json',
            params:
              '{\n  "header_color": "blue",\n  "header_title": "Workflow Start",\n  "repository": "${{ github.repository }}",\n  "workflow": "${{ github.workflow }}",\n  "workflow_url": "${{ env.WORKFLOW_URL }}"\n}',
          },
        },
      ],
    },
    publish: {
      name: 'Publish',
      'runs-on': 'ubuntu-latest',
      permissions: { contents: 'write' },
      steps: [
        {
          name: 'Checkout Main Branch',
          uses: 'actions/checkout@v3',
          with: { ref: 'main' },
        },
        {
          name: 'Set up Node 16',
          if: 'success()',
          uses: 'actions/setup-node@v3',
          with: { 'node-version': 16 },
        },
        {
          name: 'Set up PNPM',
          if: 'success()',
          uses: 'pnpm/action-setup@v2',
          with: { version: 7, run_install: false },
        },
        {
          name: 'Get PNPM Store Directory',
          id: 'pnpm-cache',
          if: 'success()',
          shell: 'bash',
          run: 'echo "STORE_PATH=$(pnpm store path)" >> $GITHUB_OUTPUT\n',
        },
        {
          name: 'Setup PNPM Cache',
          if: 'success()',
          uses: 'actions/cache@v3',
          with: {
            path: '${{ steps.pnpm-cache.outputs.STORE_PATH }}',
            key: "${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}",
            'restore-keys': '${{ runner.os }}-pnpm-store-\n',
          },
        },
        {
          name: 'Install Dependencies',
          if: 'success()',
          run: 'pnpm install',
        },
        {
          name: 'Build',
          if: 'success()',
          run: 'pnpm build',
        },
        {
          name: 'Release',
          if: 'success()',
          uses: 'northwang-lucky/auto-release@v0.0.3',
          with: {
            filepath: 'CHANGELOG.md',
            'github-token': '${{ secrets.GITHUB_TOKEN }}',
          },
        },
        {
          name: 'Publish',
          if: 'success()',
          run: 'npm config set //registry.npmjs.org/:always-auth=true\nnpm config set //registry.npmjs.org/:_authToken=${{ secrets.NPM_TOKEN }}\npnpm publish --access=public\n',
        },
      ],
    },
    'notify-success': {
      if: 'success()',
      'runs-on': 'ubuntu-latest',
      name: 'Report Success',
      needs: 'publish',
      steps: [
        {
          name: 'Notify Success',
          uses: 'northwang-lucky/chatbot-webhook-client@v1.1.1',
          with: {
            app: '${{ env.APP_NAME }}',
            webhook: '${{ secrets.CUSTOM_BOT_WEBHOOK }}',
            secret: '${{ secrets.CUSTOM_BOT_SECRET }}',
            'github-token': '${{ secrets.GITHUB_TOKEN }}',
            template: 'file://.template/lark-message-card.json',
            params:
              '{\n  "header_color": "green",\n  "header_title": "Workflow Succeed",\n  "repository": "${{ github.repository }}",\n  "workflow": "${{ github.workflow }}",\n  "workflow_url": "${{ env.WORKFLOW_URL }}"\n}',
          },
        },
      ],
    },
    'notify-failure': {
      if: 'failure()',
      'runs-on': 'ubuntu-latest',
      name: 'Report Failure',
      needs: 'publish',
      steps: [
        {
          name: 'Notify Failure',
          uses: 'northwang-lucky/chatbot-webhook-client@v1.1.1',
          with: {
            app: '${{ env.APP_NAME }}',
            webhook: '${{ secrets.CUSTOM_BOT_WEBHOOK }}',
            secret: '${{ secrets.CUSTOM_BOT_SECRET }}',
            'github-token': '${{ secrets.GITHUB_TOKEN }}',
            template: 'file://.template/lark-message-card.json',
            params:
              '{\n  "header_color": "red",\n  "header_title": "Workflow Failed",\n  "repository": "${{ github.repository }}",\n  "workflow": "${{ github.workflow }}",\n  "workflow_url": "${{ env.WORKFLOW_URL }}"\n}',
          },
        },
      ],
    },
  },
};
