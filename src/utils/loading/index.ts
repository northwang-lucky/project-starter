import { Spinner } from 'cli-spinner';

const spinner = new Spinner();
spinner.setSpinnerString(0);

// TODO replase with https://github.com/sindresorhus/ora
export const loading = {
  start(title: string) {
    spinner.setSpinnerTitle(title);
    spinner.start();
  },
  stop() {
    spinner.stop();
    spinner.clearLine(spinner.stream);
  },
};
