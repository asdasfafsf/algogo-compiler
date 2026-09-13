import { LanguageProvider } from '../../src/common/enum/LanguageProviderEnum';

const javaStackOverflow = `public class Main {
    private static void recurse() {
        recurse();
    }

    public static void main(String[] args) throws InterruptedException {
        final Throwable[] failure = new Throwable[1];
        Thread thread = new Thread(null, () -> {
            try {
                recurse();
            } catch (Throwable error) {
                failure[0] = error;
            }
        }, "recursive-overflow", 64 * 1024);
        thread.start();
        thread.join();
        if (failure[0] instanceof Error) {
            throw (Error) failure[0];
        }
    }
}`;

const nativeStackOverflow = `__attribute__((noinline)) int recurse(int value) {
    volatile int current = value;
    return recurse(value + 1) + current;
}
int main() {
    return recurse(0);
}`;

export const stackoverflowCodes: Record<LanguageProvider, string> = {
  [LanguageProvider.JAVA]: javaStackOverflow,
  [LanguageProvider.JAVA17]: javaStackOverflow,
  [LanguageProvider.CPP]: nativeStackOverflow,
  [LanguageProvider.CLANG]: nativeStackOverflow,
  [LanguageProvider.NODEJS]: `function recurse() {
    return recurse() + 1;
}
recurse();`,
  [LanguageProvider.PYTHON]: `def recurse():
    return recurse() + 1

recurse()`,
};
