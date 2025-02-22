import { Injectable } from '@nestjs/common';
import { InterpretService } from './interpret.service';
import RuntimeError from './error/runtime-error';

@Injectable()
export class PythonInterpretService extends InterpretService {
  getFileExtension(): string {
    return 'py';
  }

  getCompileCommand() {
    return 'python3';
  }

  getCompileCommandArgs(codePath: string): string[] {
    return [
      '-W',
      'ignore',
      '-c',
      `import py_compile; py_compile.compile(r'${codePath}')`,
    ];
  }

  getExecuteCommand() {
    return 'python3';
  }

  getExecuteCommandArgs(codePath: string) {
    return ['-W', 'ignore', codePath];
  }

  handleError(error: Error): void {
    if (error.message.includes('RecursionError:')) {
      throw new RuntimeError({
        message: 'RecursionError',
        detail: error.message,
      });
    } else if (error.message.includes('ValueError:')) {
      throw new RuntimeError({
        message: 'ValueError',
        detail: error.message,
      });
    } else if (error.message.includes('IndexError:')) {
      throw new RuntimeError({
        message: 'IndexError',
        detail: error.message,
      });
    } else if (error.message.includes('NameError:')) {
      throw new RuntimeError({
        message: 'NameError',
        detail: error.message,
      });
    } else if (error.message.includes('TypeError:')) {
      throw new RuntimeError({
        message: 'TypeError',
        detail: error.message,
      });
    } else if (error.message.includes('AssertionError:')) {
      throw new RuntimeError({
        message: 'AssertionError',
        detail: error.message,
      });
    } else if (error.message.includes('FileNotFoundError:')) {
      throw new RuntimeError({
        message: 'FileNotFoundError',
        detail: error.message,
      });
    } else if (error.message.includes('SyntaxError:')) {
      throw new RuntimeError({
        message: 'SyntaxError',
        detail: error.message,
      });
    } else if (error.message.includes('AttributeError:')) {
      throw new RuntimeError({
        message: 'AttributeError',
        detail: error.message,
      });
    } else if (error.message.includes('ZeroDivisionError:')) {
      throw new RuntimeError({
        message: 'ZeroDivisionError',
        detail: error.message,
      });
    } else if (error.message.includes('ModuleNotFoundError:')) {
      throw new RuntimeError({
        message: 'ModuleNotFoundError',
        detail: error.message,
      });
    } else if (error.message.includes('UnboundLocalError:')) {
      throw new RuntimeError({
        message: 'UnboundLocalError',
        detail: error.message,
      });
    } else if (error.message.includes('OverflowError:')) {
      throw new RuntimeError({
        message: 'OverflowError',
        detail: error.message,
      });
    } else if (error.message.includes('EOFError:')) {
      throw new RuntimeError({
        message: 'EOFError',
        detail: error.message,
      });
    }

    throw new RuntimeError({
      message: 'Unknown',
      detail: error.message,
    });
  }
}
