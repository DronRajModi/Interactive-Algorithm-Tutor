#include <iostream>
#include <vector>
#include <string>

using namespace std;

// Emit JSON with text, pattern, l, r, and message
void logStep(const string& text,
             const string& pattern,
             int l,
             int r,
             const string& message) {
    cout << "{";
    cout << "\"type\":\"KMP\", ";
    if (l >= 0)     cout << "\"l\":"       << l       << ", ";
    if (r >= 0)     cout << "\"r\":"       << r       << ", ";
    cout << "\"text\":\""    << text    << "\", ";
    cout << "\"pattern\":\"" << pattern << "\", ";
    cout << "\"message\":\"" << message << "\"";
    cout << "}" << endl;
}

void computeLPSArray(const string& pattern,
                     vector<int>& lps) {
    int length = 0;
    lps[0] = 0;
    int i = 1;

    while (i < (int)pattern.length()) {
        if (pattern[i] == pattern[length]) {
            length++;
            lps[i] = length;
            i++;
            logStep(/*text=*/pattern,
                    pattern,
                    /*l=*/i,
                    /*r=*/length,
                    "LPS Updated");
        } else {
            if (length != 0) {
                length = lps[length - 1];
            } else {
                lps[i] = 0;
                i++;
                logStep(/*text=*/pattern,
                        pattern,
                        /*l=*/i,
                        /*r=*/length,
                        "LPS Updated");
            }
        }
    }
}

void KMPSearch(const string& text, const string& pattern) {
    int n = text.size();
    int m = pattern.size();

    vector<int> lps(m);
    computeLPSArray(pattern, lps);

    int i = 0;  // index for text
    int j = 0;  // index for pattern

    // Initial log
    logStep(text, pattern, /*l=*/-1, /*r=*/-1, "Starting KMP Search");

    while (i < n) {
        logStep(text, pattern, /*l=*/i, /*r=*/j, "Matching characters");

        if (pattern[j] == text[i]) {
            i++;
            j++;
        }

        if (j == m) {
          
            logStep(text, pattern,
                    i - j,
                    j,
                    "Pattern found at index " + to_string(i - j));
            return;
        } else if (i < n && pattern[j] != text[i]) {
            if (j != 0) {
                j = lps[j - 1];
                logStep(text, pattern,
                        /*l=*/i,
                        /*r=*/j,
                        "Mismatch, jumping to index " + to_string(j));
            } else {
                i++;
                logStep(text, pattern,
                        /*l=*/i,
                        /*r=*/j,
                        "Mismatch, moving to next character");
            }
        }
    }

    logStep(text, pattern, /*l=*/-1, /*r=*/-1, "Pattern not found");
}

int main(int argc, char* argv[]) {
    string text    = "ABKBDABACDABABCABLB";
    string pattern = "ABABCABAB";

    if (argc > 1) text    = argv[1];
    if (argc > 2) pattern = argv[2];

    KMPSearch(text, pattern);
    return 0;
}
