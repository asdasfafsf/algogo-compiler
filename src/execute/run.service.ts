import { Injectable, Inject } from '@nestjs/common';
import {
  EXECUTE_SERVICE_FACTORY_NAME,
  ExecuteServiceFactory,
} from './execute.provider';
import { Logger } from 'winston';
import TimeoutError from './error/timeout-error';
import ExecuteResultDto from './dto/ExecuteResultDto';
import RuntimeError from './error/runtime-error';
import CompileError from './error/compile-error';
import { LanguageProvider } from '../common/enum/LanguageProviderEnum';
import { FileService } from '../file/file.service';
import * as path from 'path';
import { EXECUTE_CODE } from './constants/common';

@Injectable()
export class RunService {
  constructor(
    @Inject(EXECUTE_SERVICE_FACTORY_NAME)
    private readonly executorFactory: ExecuteServiceFactory,
    @Inject('winston')
    private readonly logger: Logger,
    private readonly fileService: FileService,
  ) {}

  async execute(
    provider: LanguageProvider,
    code: string,
    input: string,
  ): Promise<ExecuteResultDto> {
    let filePath = '';
    try {
      const executor = await this.executorFactory.get(provider);
      const compileResult = await executor.compile(code);

      if (compileResult.code !== EXECUTE_CODE.SUCCESS) {
        return compileResult;
      }

      filePath = compileResult.result;
      const result = await executor.execute(compileResult.result, input);

      return { ...result, code: EXECUTE_CODE.SUCCESS };
    } catch (e) {
      const format = {
        processTime: 0,
        memory: 0,
      };

      if (e instanceof TimeoutError) {
        return {
          ...format,
          code: EXECUTE_CODE.TIMEOUT_ERROR,
          result: '시간 초과',
          detail: '',
        };
      }

      if (e instanceof RuntimeError) {
        return {
          ...format,
          code: EXECUTE_CODE.RUNTIME_ERROR,
          result: '런타임 에러(' + (e.message || 'Unknown') + ')',
          detail: e.detail,
        };
      }

      if (e instanceof CompileError) {
        return {
          ...format,
          code: EXECUTE_CODE.COMPILE_ERROR,
          result: '컴파일 에러',
          detail: e.detail,
        };
      }

      this.logger.error(e instanceof Error ? e.message : String(e));
      return {
        ...format,
        code: EXECUTE_CODE.ERROR,
        result: '예외 오류',
        detail: '',
      };
    } finally {
      if (filePath) {
        await this.fileService.removeDir(path.dirname(filePath));
      }
    }
  }
}
