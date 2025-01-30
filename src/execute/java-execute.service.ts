import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { ExecuteService } from './execute.service';
import RuntimeError from './error/runtime-error';

@Injectable()
export class JavaExecuteService extends ExecuteService {
  getFileExtension() {
    return 'java';
  }
  getCompiledFileExtension() {
    return '';
  }
  getCompileCommand(): string {
    return 'javac';
  }
  getCompileCommandArgs(codePath: string): string[] {
    return [
      '--release',
      '11',
      '-J-Xms128m',
      '-J-Xmx256m',
      '-J-Xss512k',
      '-encoding',
      'UTF-8',
      codePath,
    ];
  }
  getExecuteCommand(): string {
    return 'java';
  }
  getExecuteCommandArgs(codePath: string): string[] {
    const tmpPath = path.dirname(codePath);
    return [
      '-cp',
      tmpPath,
      '-Xms1024m',
      '-Xmx1920m',
      '-Xss512m',
      '-Dfile.encoding=UTF-8',
      '-XX:+UseSerialGC',
      '-DONLINE_JUDGE=1',
      '-DBOJ=1',
      'Main',
    ];
  }

  handleError(error: Error) {
    if (error.message.includes('java.util.NoSuchElementException')) {
      throw new RuntimeError('NoSuchElementException');
    } else if (error.message.includes('java.util.InputMismatchException')) {
      throw new RuntimeError('InputMismatchException');
    } else if (error.message.includes('java.lang.NumberFormatException')) {
      throw new RuntimeError('NumberFormatException');
    } else if (error.message.includes('java.lang.IndexOutOfBoundsException')) {
      throw new RuntimeError('IndexOutOfBoundsException');
    } else if (
      error.message.includes('java.lang.ArrayIndexOutOfBoundsException')
    ) {
      throw new RuntimeError('ArrayIndexOutOfBoundsException');
    } else if (
      error.message.includes('java.lang.StringIndexOutOfBoundsException')
    ) {
      throw new RuntimeError('StringIndexOutOfBoundsException');
    } else if (
      error.message.includes('java.lang.ArithmeticException: divide by zero')
    ) {
      throw new RuntimeError('ArithmeticException: divide by zero');
    } else if (error.message.includes('java.lang.ArithmeticException')) {
      throw new RuntimeError('ArithmeticException');
    } else if (error.message.includes('java.lang.StackOverflowError')) {
      throw new RuntimeError('StackOverflowError');
    } else if (error.message.includes('java.io.FileNotFoundException')) {
      throw new RuntimeError('FileNotFoundException');
    } else if (error.message.includes('java.lang.NullPointerException')) {
      throw new RuntimeError('NullPointerException');
    } else if (error.message.includes('java.io.IOException')) {
      throw new RuntimeError('IOException');
    } else if (error.message.includes('java.lang.IllegalArgumentException')) {
      throw new RuntimeError('IllegalArgumentException');
    } else if (error.message.includes('java.util.EmptyStackException')) {
      throw new RuntimeError('EmptyStackException');
    } else if (
      error.message.includes('java.util.IllegalFormatConversionException')
    ) {
      throw new RuntimeError('IllegalFormatConversionException');
    } else if (error.message.includes('java.security.AccessControlException')) {
      throw new RuntimeError('AccessControlException');
    } else if (error.message.includes('java.lang.NegativeArraySizeException')) {
      throw new RuntimeError('NegativeArraySizeException');
    } else if (error.message.includes('java.lang.IllegalStateException')) {
      throw new RuntimeError('IllegalStateException');
    } else if (
      error.message.includes('java.util.UnknownFormatConversionException')
    ) {
      throw new RuntimeError('UnknownFormatConversionException');
    } else if (
      error.message.includes('java.util.ConcurrentModificationException')
    ) {
      throw new RuntimeError('ConcurrentModificationException');
    } else if (error.message.includes('java.lang.ClassCastException')) {
      throw new RuntimeError('ClassCastException');
    } else if (error.message.includes('java.lang.ArrayStoreException')) {
      throw new RuntimeError('ArrayStoreException');
    } else if (
      error.message.includes('java.lang.UnsupportedOperationException')
    ) {
      throw new RuntimeError('UnsupportedOperationException');
    } else if (
      error.message.includes('Error: Could not find or load main class Main')
    ) {
      throw new RuntimeError('Could not find or load main class Main');
    } else if (
      error.message.includes(
        'Error: Main method must return a value of type void in class Main',
      )
    ) {
      throw new RuntimeError('Main method must return a value of type void');
    } else if (
      error.message.includes('Error: Main method is not static in class Main')
    ) {
      throw new RuntimeError('Main method is not static');
    } else if (
      error.message.includes('Error: Main method not found in class Main')
    ) {
      throw new RuntimeError('Main method not found');
    }

    throw new RuntimeError('');
  }
}
