import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { Job, Queue, QueueEvents } from 'bullmq';
import { randomUUID } from 'crypto';
import { AppModule } from '../src/app.module';
import { EXECUTE_CODE } from '../src/execute/constants/common';
import { LanguageProvider } from '../src/common/enum/LanguageProviderEnum';

describe('컴파일러 BullMQ E2E', () => {
  let app: TestingModule;
  let queue: Queue;
  let events: QueueEvents;
  const jobs: Job[] = [];
  const progress: Record<string, Array<Record<string, unknown>>> = {};

  beforeAll(async () => {
    app = await Test.createTestingModule({ imports: [AppModule] }).compile();
    await app.init();
    queue = app.get<Queue>(getQueueToken('execute'));
    events = new QueueEvents('execute', {
      connection: {
        host: process.env.BULLMQ_HOST,
        port: Number(process.env.BULLMQ_PORT),
        password: process.env.BULLMQ_PASSWORD,
      },
    });
    events.on('progress', ({ jobId, data }) => {
      (progress[jobId] ??= []).push(data as Record<string, unknown>);
    });
    await events.waitUntilReady();
  });

  afterAll(async () => {
    try {
      for (const job of jobs) await job.remove();
    } finally {
      await events?.close();
      await app?.close();
    }
  });

  async function submit(
    code: string,
    inputList: { seq: number; input: string }[],
    provider: LanguageProvider = LanguageProvider.PYTHON,
  ) {
    const id = randomUUID();
    const job = await queue.add(
      'execute',
      {
        id,
        provider,
        code,
        inputList,
      },
      { jobId: id },
    );
    jobs.push(job);
    const result = await job.waitUntilFinished(events, 10_000);
    return { result, updates: progress[id] ?? [] };
  }

  it('큐 요청을 실행하고 각 입력 결과를 순서대로 전달한다', async () => {
    const { result, updates } = await submit('print(input())', [
      { seq: 1, input: 'first' },
      { seq: 2, input: 'second' },
    ]);
    expect(result.code).toBe(EXECUTE_CODE.SUCCESS);
    expect(updates.filter((value) => value.stage === 'execute')).toEqual([
      expect.objectContaining({
        seq: 1,
        code: EXECUTE_CODE.SUCCESS,
        result: 'first',
      }),
      expect.objectContaining({
        seq: 2,
        code: EXECUTE_CODE.SUCCESS,
        result: 'second',
      }),
    ]);
  });

  it('런타임 오류를 전달한 뒤에도 다음 작업을 실행한다', async () => {
    const failed = await submit('raise ValueError("expected")', [
      { seq: 1, input: '' },
    ]);
    expect(failed.updates).toContainEqual(
      expect.objectContaining({
        stage: 'execute',
        seq: 1,
        code: EXECUTE_CODE.RUNTIME_ERROR,
      }),
    );
    const next = await submit('print(42)', [{ seq: 1, input: '' }]);
    expect(next.result.code).toBe(EXECUTE_CODE.SUCCESS);
    expect(next.updates).toContainEqual(
      expect.objectContaining({ result: '42' }),
    );
  });
  it('잘못된 C++ 소스를 컴파일 오류로 반환한다', async () => {
    const { result, updates } = await submit(
      'int main( {',
      [{ seq: 1, input: '' }],
      LanguageProvider.CPP,
    );
    expect(result.code).toBe(EXECUTE_CODE.COMPILE_ERROR);
    expect(updates.filter((value) => value.stage === 'execute')).toEqual([]);
  });
});
