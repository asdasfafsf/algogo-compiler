import * as childProcessModule from 'child_process';
import { ChildProcessWithoutNullStreams } from 'child_process';
import { EventEmitter } from 'events';
import { PassThrough } from 'stream';
import { Logger } from 'winston';
import { ProcessService } from './process.service';
import TimeoutError from '../execute/error/timeout-error';

type FakeChildProcess = EventEmitter & {
  pid: number;
  exitCode: number | null;
  signalCode: NodeJS.Signals | null;
  killed: boolean;
  stdin: PassThrough;
  stdout: PassThrough;
  stderr: PassThrough;
  kill: jest.Mock;
};

describe('ProcessService', () => {
  let service: ProcessService;

  beforeEach(() => {
    service = new ProcessService(
      {
        getProcessUsage: jest.fn().mockRejectedValue(new Error('종료됨')),
      } as never,
      { silly: jest.fn(), error: jest.fn() } as unknown as Logger,
      { tmpDir: '/tmp' } as never,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const createChildProcess = (): FakeChildProcess =>
    Object.assign(new EventEmitter(), {
      pid: 1234,
      exitCode: null,
      signalCode: null,
      killed: false,
      stdin: new PassThrough(),
      stdout: new PassThrough(),
      stderr: new PassThrough(),
      kill: jest.fn(),
    });

  const mockSpawn = (childProcess: FakeChildProcess) => {
    jest
      .spyOn(childProcessModule, 'spawn')
      .mockReturnValue(
        childProcess as unknown as ChildProcessWithoutNullStreams,
      );
  };

  it('stdin EPIPE 후 정상 종료하면 실행 성공으로 처리한다', async () => {
    const childProcess = createChildProcess();
    mockSpawn(childProcess);

    const execution = service.execute('command', [], {}, 'large input');
    childProcess.stdin.emit(
      'error',
      Object.assign(new Error('broken pipe'), { code: 'EPIPE' }),
    );
    childProcess.emit('close', 0, null);

    await expect(execution).resolves.toMatchObject({ code: '0000' });
    expect(service.tasks.size).toBe(0);
  });

  it('stdin EPIPE 후 비정상 종료하면 종료 코드에 따른 오류를 반환한다', async () => {
    const childProcess = createChildProcess();
    mockSpawn(childProcess);

    const execution = service.execute('command', [], {}, 'large input');
    childProcess.stdin.emit(
      'error',
      Object.assign(new Error('broken pipe'), { code: 'EPIPE' }),
    );
    childProcess.emit('close', 1, null);

    await expect(execution).rejects.toThrow('NZEC');
    expect(service.tasks.size).toBe(0);
  });

  it('EPIPE가 아닌 stdin 오류는 호출자에게 전달한다', async () => {
    const childProcess = createChildProcess();
    mockSpawn(childProcess);
    const stdinError = Object.assign(new Error('stdin failed'), {
      code: 'EIO',
    });

    const execution = service.execute('command', [], {}, 'input');
    childProcess.stdin.emit('error', stdinError);

    await expect(execution).rejects.toBe(stdinError);
    expect(service.tasks.size).toBe(0);
  });

  it('입력을 읽기 전에 정상 종료한 실제 자식 프로세스를 처리한다', async () => {
    const execution = service.execute(
      process.execPath,
      ['-e', 'process.exit(0)'],
      {},
      'x'.repeat(1024 * 1024),
    );

    await expect(execution).resolves.toMatchObject({ code: '0000' });
    expect(service.tasks.size).toBe(0);
  });

  it('외부 SIGTERM 종료를 타임아웃으로 잘못 분류하지 않는다', async () => {
    const childProcess = createChildProcess();
    mockSpawn(childProcess);
    const options = { cwd: '/tmp' };

    const execution = service.execute('command', [], options);
    childProcess.emit('close', 143, null);

    await expect(execution).rejects.toThrow('NZEC');
    expect(options).toEqual({ cwd: '/tmp' });
    expect(childProcess.kill).toHaveBeenCalledWith('SIGKILL');
    expect(service.tasks.size).toBe(0);
  });

  it('외부 SIGKILL 종료를 타임아웃으로 잘못 분류하지 않는다', async () => {
    const childProcess = createChildProcess();
    mockSpawn(childProcess);

    const execution = service.execute('command', []);
    childProcess.emit('close', null, 'SIGKILL');

    await expect(execution).rejects.toThrow('NZEC');
    expect(service.tasks.size).toBe(0);
  });

  it('SIGTERM을 무시하는 실제 프로세스를 제한 시간 후 강제 종료한다', async () => {
    const startedAt = Date.now();

    const execution = service.execute(process.execPath, [
      '-e',
      "process.on('SIGTERM', () => {}); while (true) {}",
    ]);

    await expect(execution).rejects.toBeInstanceOf(TimeoutError);
    expect(Date.now() - startedAt).toBeLessThan(4000);
    expect(service.tasks.size).toBe(0);
  });

  it('모듈 종료 시 killed 플래그와 관계없이 살아 있는 프로세스를 종료한다', async () => {
    const childProcess = createChildProcess();
    childProcess.killed = true;
    service.tasks.set(
      'active-task',
      childProcess as unknown as ChildProcessWithoutNullStreams,
    );

    const shutdown = service.onModuleDestroy();

    expect(childProcess.kill).toHaveBeenCalledWith('SIGKILL');
    expect(service.tasks.size).toBe(1);
    childProcess.emit('close', null, 'SIGKILL');
    await shutdown;
    expect(service.tasks.size).toBe(0);
  });
});
