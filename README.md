# Algogo Compiler

BullMQ의 `execute` 큐에서 코드를 받아 실행하는 NestJS 워커다. Java, Java17, C++, Clang, Node.js, Python을 지원한다. HTTP 루트 API는 제공하지 않는다.

## 검증

Node.js 24와 pnpm 10을 사용한다. 아래 명령은 별도 Redis 및 Linux 컴파일러 환경에서 타입 검사, lint, 빌드, 단위 테스트, 기존 언어 통합 테스트, 실제 큐 E2E를 모두 실행한다.

```sh
rtk proxy npm exec --yes --package=pnpm@10.32.1 -- pnpm test:local
rtk docker compose -f compose.test.yml down
```

테스트 Redis는 별도 Compose 프로젝트에 생성하며 호스트 포트를 열지 않는다. 테스트 컨테이너는 일반 사용자로 실행하고 메모리와 프로세스 수를 제한한다.

로컬 개별 검사:

```sh
rtk pnpm install --frozen-lockfile
rtk pnpm typecheck
rtk pnpm lint
rtk pnpm build
rtk pnpm test --runInBand
rtk proxy env TMP_DIR=/tmp/algogo-compiler-test- pnpm test:integration
rtk pnpm test:e2e
```

언어 통합 테스트에는 python3, node, g++, clang++, java, javac가 필요하다. E2E는 실제 Redis를 사용하며 `TMP_DIR`, `BULLMQ_HOST`, `BULLMQ_PORT`, `BULLMQ_QUEUE_NAME=execute`를 설정한다. 테스트는 자신이 생성한 큐 작업만 제거한다.

`test`는 src의 단위 테스트, `test:integration`은 test의 언어별 실행·오류 테스트, `test:e2e`는 실제 BullMQ 워커를 검증한다. `test:all`이 세 종류를 빠짐없이 실행한다. 코드 변경 후 `lint:fix` 또는 `format`으로 포맷을 맞출 수 있다.
