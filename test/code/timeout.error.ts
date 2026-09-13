import { LanguageProvider } from '../../src/common/enum/LanguageProviderEnum';

export const timeoutErrorCodes: Record<LanguageProvider, string> = {
  [LanguageProvider.JAVA]: `public class Main {
    public static void main(String[] args) {
        while (true) {}
    }
}`,
  [LanguageProvider.JAVA17]: `public class Main {
    public static void main(String[] args) {
        while (true) {}
    }
}`,
  [LanguageProvider.CPP]: `int main() {
    volatile unsigned long long counter = 0;
    while (true) {
        counter++;
    }
}`,
  [LanguageProvider.CLANG]: `int main() {
    volatile unsigned long long counter = 0;
    while (1) {
        counter++;
    }
}`,
  [LanguageProvider.NODEJS]: `while (true) {}`,
  [LanguageProvider.PYTHON]: `while True:
    pass`,
};
