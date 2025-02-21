import { Injectable } from '@nestjs/common';
import { InterpretService } from './interpret.service';
import RuntimeError from './error/runtime-error';
import { CustomError } from './error/custom-error';

@Injectable()
export class JavascriptInterpretService extends InterpretService {
  getFileExtension(): string {
    return 'cjs';
  }

  getExecuteCommand() {
    return 'node';
  }

  getExecuteCommandArgs(codePath: string, compiledPath: string) {
    return [`--stack-size=${65535 >> 4}`, compiledPath];
  }

  handleError(error: CustomError) {
    if (error.message.includes('TypeError:')) {
      throw new RuntimeError({
        message: 'TypeError',
        detail: error.message,
      });
    } else if (error.message.includes('ReferenceError:')) {
      throw new RuntimeError({
        message: 'ReferenceError',
        detail: error.message,
      });
    } else if (error.message.includes('SyntaxError:')) {
      throw new RuntimeError({
        message: 'SyntaxError',
        detail: error.message,
      });
    } else if (error.message.includes('RangeError:')) {
      if (error.message.includes('stack size exceeded')) {
        throw new RuntimeError({
          message: 'StackSizeExceeded',
          detail: error.message,
        });
      } else {
        throw new RuntimeError({
          message: 'RangeError',
          detail: error.message,
        });
      }
    } else if (error.message.includes(`code: 'MODULE_NOT_FOUND'`)) {
      throw new RuntimeError({
        message: 'CannotFindModule',
        detail: error.message,
      });
    } else if (error.message.includes('ENOENT:')) {
      throw new RuntimeError({
        message: 'ENOENT',
        detail: error.message,
      });
    } else if (error.message.includes('EACCES:')) {
      throw new RuntimeError({
        message: 'EACCES',
        detail: error.message,
      });
    } else if (error.message.includes('ENOTDIR:')) {
      throw new RuntimeError({
        message: 'ENOTDIR',
        detail: error.message,
      });
    }

    throw new RuntimeError({
      message: 'Unknown',
      detail: error.message,
    });
  }
}
