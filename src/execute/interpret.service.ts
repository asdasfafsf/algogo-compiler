/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject, Injectable } from '@nestjs/common';
import { Execute } from './execute.interface';
import { ProcessService } from '../process/process.service';
import { FileService } from '../file/file.service';
import * as path from 'path';
import { Logger } from 'winston';
import Config from '../config/config';
import { ConfigType } from '@nestjs/config';
import RuntimeError from './error/runtime-error';
import TimeoutError from './error/timeout-error';
import ExecuteResultDto from './dto/ExecuteResultDto';
import { EXECUTE_RESULT } from './constants/common';

@Injectable()
export class InterpretService implements Execute {
  constructor(
    private readonly processService: ProcessService,
    private readonly fileService: FileService,
    @Inject('winston')
    private readonly logger: Logger,
    @Inject(Config.KEY)
    private readonly config: ConfigType<typeof Config>,
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
  getExecuteCommand(): string {
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
    try {
      const tmpDir = await this.fileService.tmpDir(this.config.tmpDir);
      const fileExtension = this.getFileExtension()
        ? `.${this.getFileExtension()}`
        : '';
      const codePath = path.resolve(tmpDir, `main${fileExtension}`);
      await this.fileService.writeFile(codePath, '', code);

      return {
        code: '0000',
        result: codePath,
        detail: '',
        processTime: 0,
        memory: 0,
      };
    } catch (e) {
      return {
        code: '9999',
        result: '전처리 오류',
        detail: '',
        processTime: 0,
        memory: 0,
      };
    } finally {
    }
  }

  async execute(codePath: string, input: string): Promise<ExecuteResultDto> {
    const tmpPath = path.dirname(codePath);
    const fileName = path.basename(codePath);

    try {
      const command = this.getExecuteCommand();
      const commandArgs = this.getExecuteCommandArgs(fileName, fileName, '');
      const options = {
        cwd: tmpPath,
      };

      const result = await this.processService.execute(
        command,
        commandArgs,
        options,
        input,
      );
      return {
        ...EXECUTE_RESULT.SUCCESS,
        ...result,
      };
    } catch (error) {
      this.logger.error('error', error);
      if (error instanceof TimeoutError) {
        throw error;
      }

      this.handleError(error);
      throw new RuntimeError({
        message: 'Unknown',
        detail: '',
      });
    } finally {
    }
  }
  handleError(error: Error) {}
}
