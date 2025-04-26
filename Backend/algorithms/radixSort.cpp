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

void countingSortByDigit(vector<int>& arr, int exp) {
    int n = arr.size();
    vector<int> output(n), count(10, 0);
    for (int x : arr) {
        int idx = (x / exp) % 10;
        count[idx]++;
        logStep(arr, "count", idx, -1,
                "Count digit " + to_string(idx));
    }
    for (int i = 1; i < 10; ++i) {
        count[i] += count[i - 1];
        logStep(arr, "accumulate", i, -1,
                "Accumulate count at " + to_string(i));
    }
    for (int i = n - 1; i >= 0; --i) {
        int x = arr[i];
        int idx = (x / exp) % 10;
        output[--count[idx]] = x;
        logStep(output, "write", count[idx], -1,
                "Placed " + to_string(x));
    }
    arr = output;
}

void radixSort(vector<int>& arr) {
    int mx = *max_element(arr.begin(), arr.end());
    for (int exp = 1; mx / exp > 0; exp *= 10) {
        logStep(arr, "digit_sort", -1, -1,
                "Sorting by digit exp=" + to_string(exp));
        countingSortByDigit(arr, exp);
    }
}

int main() {
    vector<int> arr = {38,27,43,3,9,82,10};
    logStep(arr, "start", -1, -1, "Starting radix sort");
    radixSort(arr);
    logStep(arr, "end", -1, -1, "Radix sort complete");
    return 0;
}