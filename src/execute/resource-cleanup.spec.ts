import type { Logger } from 'winston';
import { LanguageProvider } from '../common/enum/LanguageProviderEnum';
import type { FileService } from '../file/file.service';
import { ExecuteConsumer } from './execute.consumer';
import type { ExecuteServiceFactory } from './execute.provider';
import { ExecuteService } from './execute.service';
import { InterpretService } from './interpret.service';
import { RunService } from './run.service';

const logger = {
  error: jest.fn(),
  silly: jest.fn(),
} as unknown as Logger;

const deferred = () => {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
};

describe('실행 임시 디렉터리 정리', () => {
  it('RunService가 컴파일 산출물의 디렉터리 삭제를 기다린다', async () => {
    const cleanup = deferred();
    const executor = {
      compile: jest.fn().mockResolvedValue({
        code: '0000',
        result: '/tmp/compiler-job/Main',
      }),
      execute: jest.fn().mockResolvedValue({ result: '42' }),
    };
    const fileService = {
      removeDir: jest.fn().mockReturnValue(cleanup.promise),
    };
    const service = new RunService(
      {
        get: jest.fn().mockReturnValue(executor),
      } as unknown as ExecuteServiceFactory,
      logger,
      fileService as unknown as FileService,
    );

    const execution = service.execute(LanguageProvider.CPP, 'code', '');
    await new Promise(process.nextTick);

    expect(fileService.removeDir).toHaveBeenCalledWith('/tmp/compiler-job');
    let settled = false;
    void execution.finally(() => {
      settled = true;
    });
    await new Promise(process.nextTick);
    expect(settled).toBe(false);

    cleanup.resolve();
    await expect(execution).resolves.toMatchObject({ code: '0000' });
  });

  it('RunService가 전처리 실패 결과를 경로로 취급하지 않는다', async () => {
    const executor = {
      compile: jest.fn().mockResolvedValue({
        code: '9999',
        result: '전처리 오류',
        detail: '',
        processTime: 0,
        memory: 0,
      }),
      execute: jest.fn(),
    };
    const fileService = { removeDir: jest.fn() };
    const service = new RunService(
      {
        get: jest.fn().mockReturnValue(executor),
      } as unknown as ExecuteServiceFactory,
      logger,
      fileService as unknown as FileService,
    );

    await expect(
      service.execute(LanguageProvider.PYTHON, 'invalid code', ''),
    ).resolves.toMatchObject({ code: '9999', result: '전처리 오류' });
    expect(executor.execute).not.toHaveBeenCalled();
    expect(fileService.removeDir).not.toHaveBeenCalled();
  });

  it('ExecuteService가 컴파일 실패 시 디렉터리 삭제를 기다린다', async () => {
    const cleanup = deferred();
    const fileService = {
      tmpDir: jest.fn().mockResolvedValue('/tmp/compiler-job'),
      writeFile: jest.fn().mockResolvedValue(undefined),
      removeDir: jest.fn().mockReturnValue(cleanup.promise),
    };
    const service = new ExecuteService(
      {
        execute: jest.fn().mockRejectedValue(new Error('compile failed')),
      } as never,
      fileService as unknown as FileService,
      logger,
    );

    const compilation = service.compile('code');
    await new Promise(process.nextTick);
    expect(fileService.removeDir).toHaveBeenCalledWith('/tmp/compiler-job');

    cleanup.resolve();
    await expect(compilation).rejects.toMatchObject({
      detail: 'compile failed',
    });
  });

  it('InterpretService가 파일 작성 실패 시 생성한 디렉터리를 정리한다', async () => {
    const fileService = {
      tmpDir: jest.fn().mockResolvedValue('/tmp/interpreter-job'),
      writeFile: jest.fn().mockRejectedValue(new Error('write failed')),
      removeDir: jest.fn().mockResolvedValue(undefined),
    };
    const service = new InterpretService(
      {} as never,
      fileService as unknown as FileService,
      logger,
      { tmpDir: '/tmp/compiler-' } as never,
    );

    await expect(service.compile('code')).resolves.toMatchObject({
      code: '9999',
    });
    expect(fileService.removeDir).toHaveBeenCalledWith('/tmp/interpreter-job');
  });

  it('ExecuteConsumer가 작업 종료 전 디렉터리 삭제를 기다린다', async () => {
    const cleanup = deferred();
    const executor = {
      compile: jest.fn().mockResolvedValue({
        code: '0000',
        result: '/tmp/compiler-job/Main',
      }),
      execute: jest.fn().mockResolvedValue({ code: '0000', result: '42' }),
    };
    const fileService = {
      removeDir: jest.fn().mockReturnValue(cleanup.promise),
    };
    const consumer = new ExecuteConsumer(
      {
        get: jest.fn().mockReturnValue(executor),
      } as unknown as ExecuteServiceFactory,
      fileService as unknown as FileService,
    );
    const job = {
      data: {
        id: 'socket-id',
        provider: LanguageProvider.CPP,
        code: 'code',
        inputList: [{ seq: 1, input: '' }],
      },
      updateProgress: jest.fn().mockResolvedValue(undefined),
    };

    const processing = consumer.process(job as never);
    await new Promise(process.nextTick);
    expect(fileService.removeDir).toHaveBeenCalledWith('/tmp/compiler-job');

    cleanup.resolve();
    await expect(processing).resolves.toMatchObject({ code: '0000' });
    expect(job.updateProgress).toHaveBeenCalledTimes(2);
  });

  it('ExecuteConsumer가 compile progress 발행 실패에도 디렉터리를 정리한다', async () => {
    const executor = {
      compile: jest.fn().mockResolvedValue({
        code: '0000',
        result: '/tmp/compiler-job/Main',
      }),
      execute: jest.fn(),
    };
    const fileService = { removeDir: jest.fn().mockResolvedValue(undefined) };
    const consumer = new ExecuteConsumer(
      {
        get: jest.fn().mockReturnValue(executor),
      } as unknown as ExecuteServiceFactory,
      fileService as unknown as FileService,
    );
    const job = {
      data: {
        id: 'socket-id',
        provider: LanguageProvider.CPP,
        code: 'code',
        inputList: [],
      },
      updateProgress: jest.fn().mockRejectedValue(new Error('redis failed')),
    };

    await expect(consumer.process(job as never)).resolves.toMatchObject({
      code: '9999',
    });
    expect(fileService.removeDir).toHaveBeenCalledWith('/tmp/compiler-job');
  });
});
