import { LanguageProvider } from '../../src/common/enum/LanguageProviderEnum';

export const successCodes: Record<LanguageProvider, string> = {
  [LanguageProvider.JAVA]: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String input = scanner.nextLine();
        System.out.println(input);
        scanner.close();
    }
}`,
  [LanguageProvider.CPP]: `#include <iostream>
#include <string>

int main() {
    std::string input;
    std::getline(std::cin, input);
    std::cout << input << std::endl;
    return 0;
}`,
  [LanguageProvider.CLANG]: `#include <iostream>
#include <string>

int main() {
    std::string input;
    std::getline(std::cin, input);
    std::cout << input << std::endl;
    return 0;
}`,
  [LanguageProvider.JAVA17]: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String input = scanner.nextLine();
        System.out.println(input);
        scanner.close();
    }
}`,
  [LanguageProvider.NODEJS]: `const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (input) => {
  console.log(input);
  rl.close();
});`,
  [LanguageProvider.PYTHON]: `input_string = input()
print(input_string)`,
};
