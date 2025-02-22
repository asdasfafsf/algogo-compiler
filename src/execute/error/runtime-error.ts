import { CustomError } from './custom-error';

export default class RuntimeError extends CustomError {
  constructor({ message, detail }) {
    super({ message, detail });
    this.name = 'RUNTIME ERROR';
  }
}
