#include <iostream>
#include <vector>
#include <thread>
#include <chrono>
#include <string>
#include <algorithm>
using namespace std;

void sleep_ms(int ms) { this_thread::sleep_for(chrono::milliseconds(ms)); }

void logStep(const vector<int>& arr, const string& type,
             int l = -1, int r = -1, const string& message = "") {
    cout << "{";
    cout << "\"type\":\"" << type << "\"";
    cout << ",\"array\":[";
    for (size_t i = 0; i < arr.size(); ++i) cout << arr[i] << (i+1< arr.size()? ",":"");
    cout << "],\"message\":\"" << message << "\"}" << endl;
    cout.flush(); sleep_ms(300);
}

void countingSort(vector<int>& arr) {
    int n = arr.size();
    int mx = *max_element(arr.begin(), arr.end());
    vector<int> count(mx + 1, 0);
    for (int x : arr) {
        count[x]++;
        logStep(arr, "count", x, -1,
                "Increment count of " + to_string(x));
    }
    for (int i = 1; i <= mx; ++i) {
        count[i] += count[i - 1];
        logStep(arr, "accumulate", i, -1,
                "Accumulated count at " + to_string(i));
    }
    vector<int> output(n);
    for (int i = n - 1; i >= 0; --i) {
        int x = arr[i];
        output[--count[x]] = x;
        logStep(output, "write", count[x], -1,
                "Placed " + to_string(x));
    }
    arr = output;
}

int main() {
    vector<int> arr = {38,27,43,3,9,82,10};
    logStep(arr, "start", -1, -1, "Starting counting sort");
    countingSort(arr);
    logStep(arr, "end", -1, -1, "Counting sort complete");
    return 0;
}