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

## 원본 경고 대조

개별 upstream 취약점 PoC를 모두 실행한 것은 아니다. 공개된 취약 범위와 설치 버전의 비교 및 pnpm audit를 패키지 교체 검증으로 사용하고, 실제 컴파일러 작업·오류·시간 제한·자원 정리 계약은 기존 Linux 통합 테스트로 확인했다.

| GitHub 경고 | 패키지 | 취약 범위 | 수정 lockfile 버전 |
|---|---|---|---|
| [#99](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/99) | `js-yaml` | `>= 4.0.0 < 4.3.2` | `3.15.2`, `4.3.2` |
| [#98](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/98) | `js-yaml` | `>= 3.0.0 < 3.15.2` | `3.15.2`, `4.3.2` |
| [#97](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/97) | `joi` | `>= 17.2.0 < 17.13.6` | `17.13.8` |
| [#96](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/96) | `joi` | `>= 16.0.0 < 17.13.5` | `17.13.8` |
| [#95](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/95) | `multer` | `< 2.3.0` | `2.3.0` |
| [#94](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/94) | `multer` | `< 2.3.0` | `2.3.0` |
| [#93](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/93) | `multer` | `< 2.3.0` | `2.3.0` |
| [#92](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/92) | `qs` | `>= 2.2.5 < 6.16.0` | `6.16.0` |
| [#91](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/91) | `browserslist` | `<= 4.28.6` | `4.28.7` |
| [#90](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/90) | `browserslist` | `<= 4.28.6` | `4.28.7` |
| [#89](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/89) | `fast-uri` | `>= 3.0.0 < 3.1.6` | `3.1.6` |
| [#88](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/88) | `fast-uri` | `>= 3.0.0 < 3.1.6` | `3.1.6` |
| [#87](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/87) | `brace-expansion` | `< 1.1.18` | `1.1.18`, `2.1.4`, `5.0.9` |
| [#86](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/86) | `brace-expansion` | `>= 2.0.0 < 2.1.4` | `1.1.18`, `2.1.4`, `5.0.9` |
| [#85](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/85) | `brace-expansion` | `>= 2.0.0 < 2.1.2` | `1.1.18`, `2.1.4`, `5.0.9` |
| [#84](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/84) | `fast-uri` | `>= 3.0.0 <= 3.1.0` | `3.1.6` |
| [#83](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/83) | `fast-uri` | `>= 3.0.0 <= 3.1.1` | `3.1.6` |
| [#82](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/82) | `js-yaml` | `>= 4.0.0 < 4.3.1` | `3.15.2`, `4.3.2` |
| [#81](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/81) | `js-yaml` | `>= 3.0.0 < 3.15.1` | `3.15.2`, `4.3.2` |
| [#80](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/80) | `brace-expansion` | `< 1.1.17` | `1.1.18`, `2.1.4`, `5.0.9` |
| [#79](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/79) | `fast-uri` | `>= 3.0.0 < 3.1.5` | `3.1.6` |
| [#78](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/78) | `brace-expansion` | `>= 2.0.0 < 2.1.3` | `1.1.18`, `2.1.4`, `5.0.9` |
| [#76](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/76) | `body-parser` | `< 1.20.6` | `2.3.0` |
| [#75](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/75) | `brace-expansion` | `< 1.1.16` | `1.1.18`, `2.1.4`, `5.0.9` |
| [#74](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/74) | `js-yaml` | `>= 4.0.0 < 4.3.0` | `3.15.2`, `4.3.2` |
| [#73](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/73) | `js-yaml` | `>= 3.0.0 < 3.15.0` | `3.15.2`, `4.3.2` |
| [#72](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/72) | `fast-uri` | `>= 3.0.0 <= 3.1.3` | `3.1.6` |
| [#71](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/71) | `fast-uri` | `>= 3.0.0 < 3.1.3` | `3.1.6` |
| [#70](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/70) | `js-yaml` | `>= 4.0.0 <= 4.1.1` | `3.15.2`, `4.3.2` |
| [#69](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/69) | `js-yaml` | `< 3.15.0` | `3.15.2`, `4.3.2` |
| [#68](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/68) | `@babel/core` | `<= 7.29.0` | `7.29.6` |
| [#66](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/66) | `form-data` | `>= 4.0.0 < 4.0.6` | `4.0.6` |
| [#65](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/65) | `multer` | `>= 1.0.0 < 2.2.0` | `2.3.0` |
| [#64](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/64) | `joi` | `< 17.13.4` | `17.13.8` |
| [#61](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/61) | `tmp` | `< 0.2.6` | 의존성 제거 |
| [#60](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/60) | `uuid` | `< 11.1.1` | 의존성 제거 |
| [#59](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/59) | `qs` | `>= 6.11.1 <= 6.15.1` | `6.16.0` |
| [#58](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/58) | `serialize-javascript` | `>= 5.0.0 < 7.0.5` | 의존성 제거 |
| [#54](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/54) | `lodash` | `>= 4.0.0 <= 4.17.23` | `4.18.0` |
| [#53](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/53) | `lodash` | `<= 4.17.23` | `4.18.0` |
| [#52](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/52) | `picomatch` | `< 2.3.2` | `2.3.2`, `4.0.4` |
| [#51](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/51) | `picomatch` | `< 2.3.2` | `2.3.2`, `4.0.4` |
| [#50](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/50) | `@nestjs/core` | `<= 11.1.17` | `11.2.3` |
| [#49](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/49) | `@nestjs/core` | `<= 11.1.17` | `11.2.3` |
| [#48](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/48) | `path-to-regexp` | `< 0.1.13` | `8.4.2` |
| [#46](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/46) | `brace-expansion` | `>= 2.0.0 < 2.0.3` | `1.1.18`, `2.1.4`, `5.0.9` |
| [#45](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/45) | `picomatch` | `>= 4.0.0 < 4.0.4` | `2.3.2`, `4.0.4` |
| [#44](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/44) | `picomatch` | `>= 4.0.0 < 4.0.4` | `2.3.2`, `4.0.4` |
| [#43](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/43) | `flatted` | `<= 3.4.1` | `3.4.2` |
| [#42](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/42) | `flatted` | `< 3.4.0` | `3.4.2` |
| [#41](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/41) | `multer` | `< 2.1.1` | `2.3.0` |
| [#40](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/40) | `multer` | `< 2.1.0` | `2.3.0` |
| [#39](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/39) | `multer` | `< 2.1.0` | `2.3.0` |
| [#38](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/38) | `serialize-javascript` | `<= 7.0.2` | 의존성 제거 |
| [#37](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/37) | `minimatch` | `< 3.1.3` | `10.2.6`, `3.1.4`, `5.1.8`, `9.0.7` |
| [#36](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/36) | `minimatch` | `< 3.1.4` | `10.2.6`, `3.1.4`, `5.1.8`, `9.0.7` |
| [#35](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/35) | `minimatch` | `>= 9.0.0 < 9.0.7` | `10.2.6`, `3.1.4`, `5.1.8`, `9.0.7` |
| [#34](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/34) | `minimatch` | `>= 9.0.0 < 9.0.7` | `10.2.6`, `3.1.4`, `5.1.8`, `9.0.7` |
| [#33](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/33) | `minimatch` | `>= 5.0.0 < 5.1.8` | `10.2.6`, `3.1.4`, `5.1.8`, `9.0.7` |
| [#32](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/32) | `minimatch` | `>= 5.0.0 < 5.1.8` | `10.2.6`, `3.1.4`, `5.1.8`, `9.0.7` |
| [#31](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/31) | `minimatch` | `< 3.1.3` | `10.2.6`, `3.1.4`, `5.1.8`, `9.0.7` |
| [#30](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/30) | `minimatch` | `>= 9.0.0 < 9.0.6` | `10.2.6`, `3.1.4`, `5.1.8`, `9.0.7` |
| [#29](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/29) | `minimatch` | `>= 5.0.0 < 5.1.7` | `10.2.6`, `3.1.4`, `5.1.8`, `9.0.7` |
| [#28](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/28) | `ajv` | `< 6.14.0` | `6.14.0`, `8.18.0` |
| [#27](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/27) | `ajv` | `>= 7.0.0-alpha.0 < 8.18.0` | `6.14.0`, `8.18.0` |
| [#24](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/24) | `qs` | `>= 6.7.0 <= 6.14.1` | `6.16.0` |
| [#23](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/23) | `webpack` | `>= 5.49.0 < 5.104.0` | `5.104.1` |
| [#22](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/22) | `webpack` | `>= 5.49.0 <= 5.104.0` | `5.104.1` |
| [#21](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/21) | `diff` | `>= 4.0.0 < 4.0.4` | `4.0.4` |
| [#20](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/20) | `lodash` | `>= 4.0.0 <= 4.17.22` | `4.18.0` |
| [#17](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/17) | `qs` | `< 6.14.1` | `6.16.0` |
| [#16](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/16) | `glob` | `>= 10.2.0 < 10.5.0` | `13.0.6`, `7.2.3` |
| [#15](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/15) | `js-yaml` | `>= 4.0.0 < 4.1.1` | `3.15.2`, `4.3.2` |
| [#14](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/14) | `js-yaml` | `< 3.14.2` | `3.15.2`, `4.3.2` |
| [#11](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/11) | `tmp` | `<= 0.2.3` | 의존성 제거 |
| [#10](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/10) | `form-data` | `>= 4.0.0 < 4.0.4` | `4.0.6` |
| [#9](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/9) | `multer` | `>= 1.4.4-lts.1 < 2.0.2` | `2.3.0` |
| [#8](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/8) | `brace-expansion` | `>= 2.0.0 <= 2.0.1` | `1.1.18`, `2.1.4`, `5.0.9` |
| [#7](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/7) | `multer` | `>= 1.4.4-lts.1 < 2.0.1` | `2.3.0` |
| [#6](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/6) | `formidable` | `>= 3.1.1-canary.20211030 < 3.5.3` | `3.5.3` |
| [#1](https://github.com/asdasfafsf/algogo-compiler/security/dependabot/1) | `@babel/helpers` | `< 7.26.10` | `7.29.2` |

## 최종 검토

사전 의존성·호환성 조사는 별도 읽기 전용 에이전트가 수행했다. 수정 후 독립 리뷰 에이전트는 보안 요청 자동 필터로 실행을 완료하지 못했다. 독립 리뷰 통과로 간주하지 않고 담당자가 별도 읽기 전용 검토로 대체했다. 변경된 의존성의 직접 소비 경로, Node/CommonJS 호환성, queue 연결·응답 계약, 잠금 파일의 중복 버전을 다시 대조했다. 추가로 확인된 회귀는 없었다.
