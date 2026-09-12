import * as childProcessModule from 'child_process';
import { ChildProcessWithoutNullStreams } from 'child_process';
import { EventEmitter } from 'events';
import { PassThrough } from 'stream';
import { Logger } from 'winston';
import { ProcessService } from './process.service';

type FakeChildProcess = EventEmitter & {
  pid: number;
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
  });

  it('입력을 읽기 전에 정상 종료한 실제 자식 프로세스를 처리한다', async () => {
    const execution = service.execute(
      process.execPath,
      ['-e', 'process.exit(0)'],
      {},
      'x'.repeat(1024 * 1024),
    );

    await expect(execution).resolves.toMatchObject({ code: '0000' });
  });
});
