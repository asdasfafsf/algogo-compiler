# ALGOGO-180 의존성 보안 업데이트

## 범위

2026-09-13에 GitHub Dependabot open alert 81건을 `/tmp/algogo-compiler-security-alerts.json`으로 받아 현재 `pnpm-lock.yaml`과 대조했다. 경고는 NestJS core, HTTP multipart와 query parsing, 빌드 도구, YAML/JSON 처리 및 glob 계열 전이 의존성을 포함했다.

## 변경

- NestJS 런타임을 11.2.3으로, CLI를 11.0.24로 갱신하고 `@nestjs/config`, `@nestjs/bullmq`, `nest-winston`을 NestJS 11 호환 버전으로 맞췄다.
- `joi`와 BullMQ를 현재 major의 수정 버전으로 갱신했다.
- 직접 올릴 수 없는 전이 의존성은 해당 major 범위 안에서만 override했다. 주요 결과는 `multer` 2.3.0, `webpack` 5.104.1, `lodash` 4.18.0, `qs` 6.16.0, `js-yaml` 3.15.2/4.3.2, `ajv` 6.14.0/8.18.0이다.
- CLI와 빌드 트리 갱신으로 취약한 `serialize-javascript`, `tmp`, `uuid` 전이 항목이 lockfile에서 제거됐다.

## 경고 교차 검증

`pnpm audit --json`은 취약점 0건을 반환했다. 별도로 원본 81개 경고의 `vulnerable_version_range`에서 쉼표를 공백으로 정규화하고 모든 범위가 유효한 semver인지 확인한 뒤, lockfile에 설치된 모든 버전을 비교했다.

- 확인한 원본 경고: 81건
- 유효하지 않은 semver 범위: 0건
- 취약 범위에 남은 lockfile 버전: 0건
- `pnpm audit` 결과: info 0, low 0, moderate 0, high 0, critical 0

## 검증

독립 `node_modules`를 pnpm 10.32.1로 설치한 뒤 다음을 확인했다.

- `pnpm run typecheck`: 통과
- `pnpm run lint`: 통과
- `pnpm run build`: webpack 5.104.1 빌드 통과
- `pnpm test --runInBand`: 단위 테스트 15개 통과
- `docker compose -f compose.test.yml up --build --abort-on-container-exit --exit-code-from tests`: Linux 컨테이너에서 integration 58개와 BullMQ E2E 3개 통과

전체 검증 결과는 76개 테스트 통과다.
