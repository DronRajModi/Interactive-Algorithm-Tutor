#include <iostream>
#include <vector>
#include <string>

using namespace std;

void logStep(int n, int result, const string& message, const vector<int>& prevIndices = {}) {
    cout << "{";
    cout << "\"type\":\"Fibonacci\", ";
    cout << "\"n\":" << n << ", ";
    cout << "\"result\":" << result << ", ";
    cout << "\"message\":\"" << message << "\"";
    if (!prevIndices.empty()) {
        cout << ", \"prevIndices\": [";
        for (int i = 0; i < prevIndices.size(); ++i) {
            cout << prevIndices[i];
            if (i + 1 < prevIndices.size()) cout << ",";
        }
        cout << "]";
    }
    cout << "}" << endl;
}

int fibonacci(int n) {
    if (n == 0) {
        logStep(0, 0, "Base case n = 0");
        return 0;
    }
    if (n == 1) {
        logStep(1, 1, "Base case n = 1");
        return 1;
    }

    int a = 0, b = 1;
    for (int i = 2; i <= n; ++i) {
        int temp = a + b;
        logStep(i, temp, "Fibonacci calculation", {i-2, i-1});
        a = b;
        b = temp;
    }

    return b;
}

int main(int argc, char* argv[]) {
    int n = 10; 

    if (argc > 1) {
        n = stoi(argv[1]);  
    }

    logStep(n, 1, "Starting Fibonacci calculation");
    int result = fibonacci(n);
    logStep(n, result, "Fibonacci complete");

    return 0;
}
