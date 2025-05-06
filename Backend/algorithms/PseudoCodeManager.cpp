#include <iostream>
#include <fstream>
#include <string>

void serveMetaForAlgorithm(const std::string& algorithm, const std::string& category) {
    std::string basePath = "./algorithms/" + category + "/" + algorithm;
    std::ifstream sourceCode(basePath + ".cpp");
    std::ifstream pseudoCode(basePath + ".pseudo.txt");
    std::ifstream metaFile(basePath + ".meta.txt");

    if (!sourceCode || !pseudoCode || !metaFile) {
        std::cerr << "Error reading files for: " << algorithm << std::endl;
        return;
    }

    std::string line;

    std::cout << "START_SOURCE\n";
    while (std::getline(sourceCode, line)) std::cout << line << '\n';

    std::cout << "END_SOURCE\nSTART_PSEUDO\n";
    while (std::getline(pseudoCode, line)) std::cout << line << '\n';

    std::cout << "END_PSEUDO\nSTART_META\n";
    while (std::getline(metaFile, line)) std::cout << line << '\n';
    
    std::cout << "END_META\n";
}

int main(int argc, char* argv[]) {
    if (argc < 3) {
        std::cerr << "Usage: ./PseudoCodeManager <AlgorithmName> <Category>\n";
        return 1;
    }

    serveMetaForAlgorithm(argv[1], argv[2]);
    return 0;
}
