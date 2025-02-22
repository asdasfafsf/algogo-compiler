export class CustomError extends Error {
  detail: string;

  constructor({ message, detail }: { message: string; detail: string }) {
    super(message);
    this.detail = detail;
    this.name = 'CustomError';
  }
}
