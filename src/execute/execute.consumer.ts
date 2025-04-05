import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject, Injectable } from '@nestjs/common';
import {
  EXECUTE_SERVICE_FACTORY_NAME,
  ExecuteServiceFactory,
} from './execute.provider';
import CompileError from './error/compile-error';
import RuntimeError from './error/runtime-error';
import TimeoutError from './error/timeout-error';
import { FileService } from 'src/file/file.service';
import * as path from 'path';
import ExecuteResultDto from './dto/ExecuteResultDto';
import {
  EXECUTE_CODE,
  EXECUTE_MESSAGE,
  EXECUTE_RESULT,
} from './constants/common';

@Processor('execute')
@Injectable()
export class ExecuteConsumer extends WorkerHost {
  constructor(
    @Inject(EXECUTE_SERVICE_FACTORY_NAME)
    private readonly executorFactory: ExecuteServiceFactory,
    private readonly fileService: FileService,
  ) {
    super();
  }

  async process(job: Job): Promise<ExecuteResultDto> {
    const { data } = job;
    const { id, provider, inputList } = data;
    const executor = await this.executorFactory.get(provider);

    let filePath = '';

    try {
      const compileResult = await executor.compile(data.code);

      if (compileResult.code !== EXECUTE_CODE.SUCCESS) {
        return {
          ...compileResult,
          ...EXECUTE_RESULT.COMPILE_ERROR,
          processTime: 0,
          memory: 0,
        };
      }

      job.updateProgress({ stage: 'compile', ...EXECUTE_RESULT.SUCCESS });
      filePath = compileResult.result;

      for (const { seq, input } of inputList) {
        const executeResult = await executor
          .execute(compileResult.result, input)
          .catch((e) => {
            if (e instanceof RuntimeError) {
              return {
                code: EXECUTE_CODE.RUNTIME_ERROR,
                result:
                  EXECUTE_MESSAGE.RUNTIME_ERROR +
                  '(' +
                  (e.message || 'Unknown') +
                  ')',
                detail: e.detail,
                processTime: 0,
                memory: 0,
              };
            }

            if (e instanceof TimeoutError) {
              return {
                ...EXECUTE_RESULT.TIMEOUT_ERROR,
                detail: '',
                processTime: 0,
                memory: 0,
              };
            }

            return {
              ...EXECUTE_RESULT.ERROR,
              detail: '',
              processTime: 0,
              memory: 0,
            };
          });
        job.updateProgress({ stage: 'execute', id, seq, ...executeResult });
      }

      return {
        ...EXECUTE_RESULT.SUCCESS,
        detail: '',
        processTime: 0,
        memory: 0,
      };
    } catch (e) {
      const format = {
        processTime: 0,
        memory: 0,
      };
      if (e instanceof CompileError) {
        return {
          ...format,
          ...EXECUTE_RESULT.COMPILE_ERROR,
          detail: e.detail,
        };
      }

      return {
        ...format,
        ...EXECUTE_RESULT.ERROR,
        detail: '',
      };
    } finally {
      if (filePath) {
        this.fileService.removeDir(path.dirname(filePath));
      }
    }
  }
}
