#include <iostream>
#include <vector>
#include <string>
#include <sstream>

using namespace std;

void logStep(const string& text, int l, int r, const string& message) {
    cout << "{";
    cout << "\"type\":\"KMP\", ";
    if (l >= 0) cout << "\"l\":" << l << ", ";
    if (r >= 0) cout << "\"r\":" << r << ", ";
    cout << "\"text\":\"" << text << "\", ";
    cout << "\"message\":\"" << message << "\"";
    cout << "}" << endl;
}

void computeLPSArray(const string& pattern, vector<int>& lps) {
    int length = 0;
    lps[0] = 0;
    int i = 1;
    while (i < pattern.length()) {
        if (pattern[i] == pattern[length]) {
            length++;
            lps[i] = length;
            i++;
            logStep(pattern, i, length, "LPS Updated");
        } else {
            if (length != 0) {
                length = lps[length - 1];
            } else {
                lps[i] = 0;
                i++;
                logStep(pattern, i, length, "LPS Updated");
            }
        }
    }
}

void KMPSearch(const string& text, const string& pattern) {
    vector<int> lps(pattern.size(), 0);
    computeLPSArray(pattern, lps);

    int i = 0, j = 0;
    while (i < text.size()) {
        logStep(text, i, j, "Matching characters");
        if (pattern[j] == text[i]) {
            i++;
            j++;
        }

        if (j == pattern.size()) {
            logStep(text, i, j, "Pattern found at index " + to_string(i - j));
            return;
        } else if (i < text.size() && pattern[j] != text[i]) {
            if (j != 0) {
                j = lps[j - 1];
                logStep(text, i, j, "Mismatch, jumping to index " + to_string(j));
            } else {
                i++;
                logStep(text, i, j, "Mismatch, moving to next character");
            }
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

    logStep(text, -1, -1, "Starting KMP Search");
    KMPSearch(text, pattern);
    return 0;
}
