import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import {
  ChildProcessWithoutNullStreams,
  SpawnOptionsWithoutStdio,
  spawn,
} from 'child_process';
import { ProcessManagementService } from './process-management.service';
import ExecuteResultDto from 'src/execute/dto/ExecuteResultDto';
import { uuidv7 } from 'uuidv7';
import { Logger } from 'winston';
import Config from '../config/config';
import { ConfigType } from '@nestjs/config';
import TimeoutError from '../execute/error/timeout-error';

@Injectable()
export class ProcessService implements OnModuleDestroy {
  tasks: Map<string, ChildProcessWithoutNullStreams>;

  constructor(
    private readonly processManagementService: ProcessManagementService,
    @Inject('winston')
    private readonly logger: Logger,
    @Inject(Config.KEY)
    private readonly config: ConfigType<typeof Config>,
  ) {
    this.tasks = new Map();
  }

  async execute(
    command: string,
    commandArgs: string[],
    option: SpawnOptionsWithoutStdio = {},
    input: string = '',
  ): Promise<ExecuteResultDto> {
    const uuid = uuidv7();
    const startTime = performance.now();

    this.logger.silly(`Executing command: ${command} ${commandArgs.join(' ')}`);

    const childProcess = spawn(command, commandArgs, option);
    this.tasks.set(uuid, childProcess);

    let currentMemory = 0;
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      childProcess.kill('SIGKILL');
    }, 2000);

    const checkProcessUsageInterval = setInterval(async () => {
      try {
        const processUsage =
          await this.processManagementService.getProcessUsage(childProcess.pid);
        const { memory } = processUsage;
        currentMemory = Math.max(memory, currentMemory);
      } catch {
        clearInterval(checkProcessUsageInterval);
      }
    }, 100);

    return new Promise<ExecuteResultDto>((resolve, reject) => {
      const result = [];
      const stdError = [];

      childProcess.stdin.on('error', (error: NodeJS.ErrnoException) => {
        if (error.code !== 'EPIPE') {
          reject(error);
        }
      });

      this.logger.silly('process input : ' + input);
      if (input) {
        childProcess.stdin.write(input);
        childProcess.stdin.end();
      } else {
        childProcess.stdin.write('\n');
        childProcess.stdin.end();
      }

      childProcess.stdout.on('data', (e) => {
        result.push(e.toString());
      });

      childProcess.on('close', (closeCode, closeResult) => {
        clearTimeout(timeout);
        clearInterval(checkProcessUsageInterval);
        const results = result.join('').split('\n');

        if (results.at(-1) === '') {
          results.pop();
        }

        if (timedOut) {
          return reject(new TimeoutError('시간 초과'));
        }

        if (closeCode === 0) {
          return resolve({
            code: '0000',
            processTime: Number((performance.now() - startTime).toFixed(1)),
            memory: Number((currentMemory / 1024 ** 2).toFixed(1)),
            result: results.join('\n'),
            detail: '',
          });
        }

        // if (stdError.length === 0 && closeCode !== 0) {
        //   reject(new Error('NZEC'));
        // }

        switch (closeResult) {
          case 'SIGSEGV':
            reject(new Error('Segmentation fault'));
            break;
          case 'SIGABRT':
            reject(
              new Error(
                stdError.length > 0 ? stdError.join('') : result.join(''),
              ),
            );
            break;
          case 'SIGBUS':
            reject(new Error('BusError'));
            break;
          default:
            if (stdError.length === 0) {
              reject(new Error('NZEC'));
            } else {
              reject(new Error(stdError.join('')));
            }
        }
      });

      childProcess.on('error', (error) => {
        clearTimeout(timeout);
        clearInterval(checkProcessUsageInterval);
        reject(error);
      });

      childProcess.stderr.on('data', (error) => {
        const tmpDirPattern = new RegExp(
          `${this.config.tmpDir}|${process.cwd()}`,
          'g',
        );
        const message = error.toString().replace(tmpDirPattern, '');
        stdError.push(message);
      });
    })
      .then((responseExecute) => responseExecute)
      .finally(() => {
        clearTimeout(timeout);
        clearInterval(checkProcessUsageInterval);
        childProcess.kill('SIGKILL');
        this.tasks.delete(uuid);
      });
  }

  async onModuleDestroy(): Promise<void> {
    await this.clearAllProcesses();
  }

  async clearAllProcesses(): Promise<void> {
    const activeProcesses = [...this.tasks.values()].filter(
      (process) => process.exitCode === null && process.signalCode === null,
    );

    await Promise.all(
      activeProcesses.map(
        (process) =>
          new Promise<void>((resolve) => {
            process.once('close', resolve);
            process.kill('SIGKILL');
          }),
      ),
    );

    this.tasks.clear();
  }
}
