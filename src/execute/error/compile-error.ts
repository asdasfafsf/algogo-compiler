import { CustomError } from './custom-error';

export default class CompileError extends CustomError {
  constructor({ message, detail }: { message: string; detail: string }) {
    super({ message, detail });
    this.name = 'COMPILE ERROR';
  }
}
