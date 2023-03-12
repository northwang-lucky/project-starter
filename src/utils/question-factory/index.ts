import inquirer, { Answers, CheckboxQuestion, InputQuestion, ListQuestion, Question } from 'inquirer';
import SearchList from 'inquirer-search-list';

inquirer.registerPrompt('search-list', SearchList);

type QuestionFn<T extends Answers, Q extends Question<T>> = (name: keyof T, options: Omit<Q, 'name' | 'type'>) => Q;

type QuestionInstance<T extends Answers> = {
  list: QuestionFn<T, ListQuestion<T>>;
  input: QuestionFn<T, InputQuestion<T>>;
  checkbox: QuestionFn<T, CheckboxQuestion<T>>;
  searchList: QuestionFn<T, ListQuestion<T>>;
};

function createInstance<T extends Answers>(): QuestionInstance<T> {
  return {
    list: (name, options) => ({
      name: name as string,
      type: 'list',
      ...options,
    }),
    input: (name, options) => ({
      name: name as string,
      type: 'input',
      ...options,
    }),
    checkbox: (name, options) => ({
      name: name as string,
      type: 'checkbox',
      ...options,
    }),
    searchList: (name, options) => ({
      name: name as string,
      type: 'search-list' as 'list',
      ...options,
    }),
  };
}

export function questionFactory<T extends Answers>(
  fn: (question: QuestionInstance<T>) => Question<T>[]
): Question<T>[] {
  const question = createInstance<T>();
  return fn(question);
}
