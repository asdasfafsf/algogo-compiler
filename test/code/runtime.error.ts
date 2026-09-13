import { LanguageProvider } from '../../src/common/enum/LanguageProviderEnum';

export const runtimeErrorCode: Record<LanguageProvider, string> = {
  [LanguageProvider.JAVA]: `public class Main {
    public static void main(String[] args) {
        throw new RuntimeException("runtime failure");
    }
}`,
  [LanguageProvider.JAVA17]: `public class Main {
    public static void main(String[] args) {
        throw new RuntimeException("runtime failure");
    }
}`,
  [LanguageProvider.CPP]: `#include <iostream>
int main() {
    std::cerr << "runtime failure";
    return 1;
}`,
  [LanguageProvider.CLANG]: `#include <stdio.h>
int main() {
    fprintf(stderr, "runtime failure");
    return 1;
}`,
  [LanguageProvider.NODEJS]: `throw new Error('runtime failure');`,
  [LanguageProvider.PYTHON]: `raise RuntimeError('runtime failure')`,
};
