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
      throw new RuntimeError({
        message: 'NoSuchElementException',
        detail: error.message,
      });
    } else if (error.message.includes('java.util.InputMismatchException')) {
      throw new RuntimeError({
        message: 'InputMismatchException',
        detail: error.message,
      });
    } else if (error.message.includes('java.lang.NumberFormatException')) {
      throw new RuntimeError({
        message: 'NumberFormatException',
        detail: error.message,
      });
    } else if (error.message.includes('java.lang.IndexOutOfBoundsException')) {
      throw new RuntimeError({
        message: 'IndexOutOfBoundsException',
        detail: error.message,
      });
    } else if (
      error.message.includes('java.lang.ArrayIndexOutOfBoundsException')
    ) {
      throw new RuntimeError({
        message: 'ArrayIndexOutOfBoundsException',
        detail: error.message,
      });
    } else if (
      error.message.includes('java.lang.StringIndexOutOfBoundsException')
    ) {
      throw new RuntimeError({
        message: 'StringIndexOutOfBoundsException',
        detail: error.message,
      });
    } else if (
      error.message.includes('java.lang.ArithmeticException: divide by zero')
    ) {
      throw new RuntimeError({
        message: 'ArithmeticException: divide by zero',
        detail: error.message,
      });
    } else if (error.message.includes('java.lang.ArithmeticException')) {
      throw new RuntimeError({
        message: 'ArithmeticException',
        detail: error.message,
      });
    } else if (error.message.includes('java.lang.StackOverflowError')) {
      throw new RuntimeError({
        message: 'StackOverflowError',
        detail: error.message,
      });
    } else if (error.message.includes('java.io.FileNotFoundException')) {
      throw new RuntimeError({
        message: 'FileNotFoundException',
        detail: error.message,
      });
    } else if (error.message.includes('java.lang.NullPointerException')) {
      throw new RuntimeError({
        message: 'NullPointerException',
        detail: error.message,
      });
    } else if (error.message.includes('java.io.IOException')) {
      throw new RuntimeError({
        message: 'IOException',
        detail: error.message,
      });
    } else if (error.message.includes('java.lang.IllegalArgumentException')) {
      throw new RuntimeError({
        message: 'IllegalArgumentException',
        detail: error.message,
      });
    } else if (error.message.includes('java.util.EmptyStackException')) {
      throw new RuntimeError({
        message: 'EmptyStackException',
        detail: error.message,
      });
    } else if (
      error.message.includes('java.util.IllegalFormatConversionException')
    ) {
      throw new RuntimeError({
        message: 'IllegalFormatConversionException',
        detail: error.message,
      });
    } else if (error.message.includes('java.security.AccessControlException')) {
      throw new RuntimeError({
        message: 'AccessControlException',
        detail: error.message,
      });
    } else if (error.message.includes('java.lang.NegativeArraySizeException')) {
      throw new RuntimeError({
        message: 'NegativeArraySizeException',
        detail: error.message,
      });
    } else if (error.message.includes('java.lang.IllegalStateException')) {
      throw new RuntimeError({
        message: 'IllegalStateException',
        detail: error.message,
      });
    } else if (
      error.message.includes('java.util.UnknownFormatConversionException')
    ) {
      throw new RuntimeError({
        message: 'UnknownFormatConversionException',
        detail: error.message,
      });
    } else if (
      error.message.includes('java.util.ConcurrentModificationException')
    ) {
      throw new RuntimeError({
        message: 'ConcurrentModificationException',
        detail: error.message,
      });
    } else if (error.message.includes('java.lang.ClassCastException')) {
      throw new RuntimeError({
        message: 'ClassCastException',
        detail: error.message,
      });
    } else if (error.message.includes('java.lang.ArrayStoreException')) {
      throw new RuntimeError({
        message: 'ArrayStoreException',
        detail: error.message,
      });
    } else if (
      error.message.includes('java.lang.UnsupportedOperationException')
    ) {
      throw new RuntimeError({
        message: 'UnsupportedOperationException',
        detail: error.message,
      });
    } else if (
      error.message.includes('Error: Could not find or load main class Main')
    ) {
      throw new RuntimeError({
        message: 'Could not find or load main class Main',
        detail: error.message,
      });
    } else if (
      error.message.includes(
        'Error: Main method must return a value of type void in class Main',
      )
    ) {
      throw new RuntimeError({
        message: 'Main method must return a value of type void',
        detail: error.message,
      });
    } else if (
      error.message.includes('Error: Main method is not static in class Main')
    ) {
      throw new RuntimeError({
        message: 'Main method is not static',
        detail: error.message,
      });
    } else if (
      error.message.includes('Error: Main method not found in class Main')
    ) {
      throw new RuntimeError({
        message: 'Main method not found',
        detail: error.message,
      });
    }

    throw new RuntimeError({
      message: 'Unknown',
      detail: error.message,
    });
  }
}
