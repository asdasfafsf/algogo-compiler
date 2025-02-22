import { Injectable } from '@nestjs/common';
import { ExecuteService } from './execute.service';
import RuntimeError from './error/runtime-error';

@Injectable()
export class CppExecuteService extends ExecuteService {
  getCompileCommand(): string {
    return 'g++';
  }

  getCompileCommandArgs(codePath: string, compiledPath: string): string[] {
    return [
      codePath,
      '-o',
      compiledPath,
      '-O2',
      '-Wall',
      '-lm',
      '-std=gnu++17',
      '-DONLINE_JUDGE',
      '-DBOJ',
    ];
  }

  getExecuteCommand(codePath: string, compiledPath: string): string {
    return compiledPath;
  }

  getExecuteCommandArgs(): string[] {
    return [];
  }

  getFileExtension(): string {
    return 'cc';
  }

  handleError(error: Error) {
    if (error.message === 'Segmentation fault') {
      throw new RuntimeError({
        message: 'Segmentation fault',
        detail: error.message,
      });
    } else if (
      error.message.includes('Buffer contains: This is a') ||
      error.message.includes('buffer overflow detected')
    ) {
      throw new RuntimeError({
        message: 'BufferOverflow',
        detail: error.message,
      });
    } else if (error.message.includes('free(): invalid pointer')) {
      throw new RuntimeError({
        message: 'InvalidPointer',
        detail: error.message,
      });
    } else if (error.message.includes('double free or corruption')) {
      throw new RuntimeError({
        message: 'DoubleFree',
        detail: error.message,
      });
    } else if (error.message.includes('malloc(): memory corruption')) {
      throw new RuntimeError({
        message: 'MemoryCorruption',
        detail: error.message,
      });
    } else if (error.message.includes('std::out_of_range')) {
      throw new RuntimeError({
        message: 'out_of_range',
        detail: error.message,
      });
    } else if (
      error.message.includes('attempt to decrement a past-the-end iterator')
    ) {
      throw new RuntimeError({
        message: 'PastTheEndIterator',
        detail: error.message,
      });
    } else if (error.message.includes('free(): invalid next size')) {
      throw new RuntimeError({
        message: 'InvalidNextSize',
        detail: error.message,
      });
    } else if (error.message.includes('std::bad_alloc')) {
      throw new RuntimeError({
        message: 'bad_alloc',
        detail: error.message,
      });
    } else if (error.message.includes('std::bad_array_new_length')) {
      throw new RuntimeError({
        message: 'bad_array_new_length',
        detail: error.message,
      });
    } else if (error.message.match(/Assertion\s+`([^']+)'\s+failed/)) {
      throw new RuntimeError({
        message: 'AssertionFailed',
        detail: error.message,
      });
    } else if (error.message === 'BusError') {
      throw new RuntimeError({
        message: 'BusError',
        detail: error.message,
      });
    } else if (error.message.includes('corrupted double-linked list')) {
      throw new RuntimeError({
        message: 'CorruptedList',
        detail: error.message,
      });
    } else if (
      error.message.toLowerCase().includes('floating point exception')
    ) {
      throw new RuntimeError({
        message: 'FloatingPointException',
        detail: error.message,
      });
    }

    throw new RuntimeError({
      message: 'Unknown',
      detail: error.message,
    });
  }
}
