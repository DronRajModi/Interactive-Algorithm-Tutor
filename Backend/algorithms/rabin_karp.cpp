#include <iostream>
#include <string>

using namespace std;

const int d = 256; // Number of characters in the input alphabet
const int q = 101; // A prime number for hashing

void logStep(const string& text, int l, int r, const string& message) {
    cout << "{";
    cout << "\"type\":\"Rabin-Karp\", ";
    if (l >= 0) cout << "\"l\":" << l << ", ";
    if (r >= 0) cout << "\"r\":" << r << ", ";
    cout << "\"text\":\"" << text << "\", ";
    cout << "\"message\":\"" << message << "\"";
    cout << "}" << endl;
}

void rabinKarpSearch(const string& text, const string& pattern) {
    int n = text.size();
    int m = pattern.size();
    int i, j;
    int p = 0; // hash value for pattern
    int t = 0; // hash value for text
    int h = 1;

    for (i = 0; i < m - 1; i++) {
        h = (h * d) % q;
    }

    for (i = 0; i < m; i++) {
        p = (d * p + pattern[i]) % q;
        t = (d * t + text[i]) % q;
    }

    for (i = 0; i <= n - m; i++) {
        logStep(text, i, -1, "Checking substring starting at index " + to_string(i));
        if (p == t) {
            for (j = 0; j < m; j++) {
                if (text[i + j] != pattern[j]) break;
            }
            if (j == m) {
                logStep(text, i, -1, "Pattern found at index " + to_string(i));
                return;
            }
        }

        if (i < n - m) {
            t = (d * (t - text[i] * h) + text[i + m]) % q;
            if (t < 0) t = (t + q);
        }
    }

    logStep(text, -1, -1, "Pattern not found");
}

int main(int argc, char* argv[]) {
    string text = "ABABDABACDABABCABAB";
    string pattern = "ABABCABAB";

    if (argc > 1) {
        text = argv[1];  // Set custom text if provided
    }
    if (argc > 2) {
        pattern = argv[2];  // Set custom pattern if provided
    }

    logStep(text, -1, -1, "Starting Rabin-Karp Search");
    rabinKarpSearch(text, pattern);
    return 0;
}
