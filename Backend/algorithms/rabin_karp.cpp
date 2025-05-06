#include <iostream>
#include <string>

using namespace std;

const int d = 256; // Number of characters in the input alphabet
const int q = 101; // A prime number for hashing

// Now take pattern by reference so logStep can always print it
void logStep(const string& text, int l, int r, const string& message, const string& pattern) {
    cout << "{";
    cout << "\"type\":\"Rabin-Karp\", ";
    if (l >= 0) cout << "\"l\":" << l << ", ";
    if (r >= 0) cout << "\"r\":" << r << ", ";
    cout << "\"text\":\"" << text << "\", ";
    cout << "\"pattern\":\"" << pattern << "\", ";
    cout << "\"message\":\"" << message << "\"";
    cout << "}" << endl;
}

void rabinKarpSearch(const string& text, const string& pattern) {
    int n = text.size();
    int m = pattern.size();
    int p = 0; // hash for pattern
    int t = 0; // hash for text
    int h = 1;

    // Precompute h = (d^(m-1)) % q
    for (int i = 0; i < m - 1; i++)
        h = (h * d) % q;

    // Initial hash values
    for (int i = 0; i < m; i++) {
        p = (d * p + pattern[i]) % q;
        t = (d * t + text[i]) % q;
    }

    // Slide over text
    for (int i = 0; i <= n - m; i++) {
        logStep(text, i, -1, "Checking substring starting at index " + to_string(i), pattern);

        if (p == t) {
            int j;
            for (j = 0; j < m; j++)
                if (text[i + j] != pattern[j])
                    break;
            if (j == m) {
                logStep(text, i, -1, "Pattern found at index " + to_string(i), pattern);
                return;
            }
        }

        // Compute next window hash
        if (i < n - m) {
            t = (d * (t - text[i] * h) + text[i + m]) % q;
            if (t < 0) t += q;
        }
    }

    logStep(text, -1, -1, "Pattern not found", pattern);
}

int main(int argc, char* argv[]) {
    string text  = "pananansnandskajn";
    string pattern = "pan";

    if (argc > 1) text    = argv[1];
    if (argc > 2) pattern = argv[2];

    logStep(text, -1, -1, "Starting Rabin-Karp Search", pattern);
    rabinKarpSearch(text, pattern);
    return 0;
}
