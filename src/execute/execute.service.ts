/* eslint-disable @typescript-eslint/no-unused-vars */

import * as path from 'path';
import { ProcessService } from '../process/process.service';
import { Execute } from './execute.interface';
import { Inject, Injectable } from '@nestjs/common';
import { FileService } from '../file/file.service';
import CompileError from './error/compile-error';
import RuntimeError from './error/runtime-error';
import { Logger } from 'winston';
import TimeoutError from './error/timeout-error';
import ExecuteResultDto from './dto/ExecuteResultDto';
import { CustomError } from './error/custom-error';

@Injectable()
export class ExecuteService implements Execute {
  constructor(
    private readonly processService: ProcessService,
    private readonly fileService: FileService,
    @Inject('winston')
    private readonly logger: Logger,
  ) {}

  getFileExtension(): string {
    return '';
  }
  getCompiledFileExtension(): string {
    return '';
  }
  getCompileCommand(): string {
    return '';
  }
  getCompileCommandArgs(
    codePath: string,
    compiledPath: string,
    code: string,
  ): string[] {
    return [];
  }
  getExecuteCommand(
    codePath: string,
    compiledPath: string,
    code: string,
  ): string {
    return '';
  }
  getExecuteCommandArgs(
    codePath: string,
    compiledPath: string,
    code: string,
  ): string[] {
    return [];
  }

  async compile(code: string) {
    const tmpDir = await this.fileService.tmpDir(process.env.TMP_DIR);

    try {
      const fileExtension = this.getFileExtension()
        ? `.${this.getFileExtension()}`
        : '';
      const codePath = path.resolve(tmpDir, `Main${fileExtension}`);

      await this.fileService.writeFile(codePath, '', code);

      const compiledFileExtension = this.getCompiledFileExtension()
        ? `.${this.getCompiledFileExtension()}`
        : '';
      const compiledFilePath = `Main${compiledFileExtension}`;

      const command = this.getCompileCommand();
      const commandArgs = this.getCompileCommandArgs(
        path.basename(codePath),
        path.basename(compiledFilePath),
        code,
      );

      const options = {
        cwd: tmpDir,
      };
      const result = await this.processService.execute(
        command,
        commandArgs,
        options,
      );

      return {
        code: '0000',
        ...result,
        result: path.resolve(tmpDir, compiledFilePath),
      };
    } catch (e) {
      this.fileService.removeDir(tmpDir);
      this.logger.error(e);
      throw new CompileError({
        message: '컴파일 에러',
        detail: e.message,
      });
    } finally {
    }
  }

  async execute(
    compiledFilePath: string,
    input: string,
  ): Promise<ExecuteResultDto> {
    const tmpPath = path.dirname(compiledFilePath);

    const fileExtension = this.getFileExtension()
      ? `.${this.getFileExtension()}`
      : '';
    const filePath = path.resolve(tmpPath, `Main${fileExtension}`);

    try {
      this.logger.silly(`start process`);
      const command = this.getExecuteCommand(filePath, compiledFilePath, '');
      const commandArgs = this.getExecuteCommandArgs(filePath, '', '');
      const options = {
        cwd: tmpPath,
      };

      this.logger.silly(`start execute`, {
        command: command,
        commandArgs: commandArgs,
        options: options,
        input: input,
      });
      const result = await this.processService.execute(
        command,
        commandArgs,
        options,
        input,
      );
      return {
        code: '0000',
        ...result,
      };
    } catch (e) {
      this.logger.error(`Execute Error occurred: ${e.message}`);
      this.logger.error(`Execute Error name: ${e.name}`);
      this.logger.error(`Execute Stack trace: ${e.stack}`);
      if (e instanceof TimeoutError) {
        throw e;
      }

      this.handleError(e);

      throw new RuntimeError({
        message: 'Unknown',
        detail: '',
      });
    } finally {
    }
  }

  handleError(error: Error) {}
}
