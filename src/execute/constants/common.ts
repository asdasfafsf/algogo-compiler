export const EXECUTE_CODE = {
  COMPILE_ERROR: '9001',
  RUNTIME_ERROR: '9002',
  TIMEOUT_ERROR: '9000',
  SUCCESS: '0000',
  ERROR: '9999',
} as const;

export const EXECUTE_MESSAGE = {
  COMPILE_ERROR: '컴파일 오류',
  RUNTIME_ERROR: '런타임 오류',
  TIMEOUT_ERROR: '시간 초과',
  SUCCESS: '성공',
  ERROR: '예외 오류',
} as const;

export const EXECUTE_RESULT = {
  COMPILE_ERROR: {
    code: EXECUTE_CODE.COMPILE_ERROR,
    result: EXECUTE_MESSAGE.COMPILE_ERROR,
  },
  RUNTIME_ERROR: {
    code: EXECUTE_CODE.RUNTIME_ERROR,
    result: EXECUTE_MESSAGE.RUNTIME_ERROR,
  },
  TIMEOUT_ERROR: {
    code: EXECUTE_CODE.TIMEOUT_ERROR,
    result: EXECUTE_MESSAGE.TIMEOUT_ERROR,
  },
  SUCCESS: {
    code: EXECUTE_CODE.SUCCESS,
    result: EXECUTE_MESSAGE.SUCCESS,
  },
  ERROR: {
    code: EXECUTE_CODE.ERROR,
    result: EXECUTE_MESSAGE.ERROR,
  },
} as const;
