#include <iostream>
#include <vector>
#include <thread>
#include <chrono>
#include <string>
using namespace std;

void sleep_ms(int ms) { this_thread::sleep_for(chrono::milliseconds(ms)); }

void logStep(const vector<int>& arr, const string& type,
             int l = -1, int r = -1, const string& message = "") {
    cout << "{";
    cout << "\"type\":\"" << type << "\"";
    if (l >= 0) cout << ",\"l\":" << l;
    if (r >= 0) cout << ",\"r\":" << r;
    cout << ",\"array\":[";
    for (size_t i = 0; i < arr.size(); ++i) cout << arr[i] << (i+1< arr.size()? ",":"");
    cout << "],\"message\":\"" << message << "\"}" << endl;
    cout.flush(); sleep_ms(300);
}

void insertionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 1; i < n; ++i) {
        int key = arr[i];
        int j = i - 1;
        logStep(arr, "key", i, -1, "Key = " + to_string(key));
        while (j >= 0 && arr[j] > key) {
            logStep(arr, "compare", j, i,
                    "Comparing " + to_string(arr[j]) + " and key");
            arr[j + 1] = arr[j];
            logStep(arr, "shift", j, j+1,
                    "Shifted " + to_string(arr[j]) + " to position " + to_string(j+1));
            --j;
        }
        arr[j + 1] = key;
        logStep(arr, "insert", j+1, -1,
                "Inserted key at index " + to_string(j+1));
    }
}

int main() {
    vector<int> arr = {38,27,43,3,9,82,10};
    logStep(arr, "start", -1, -1, "Starting insertion sort");
    insertionSort(arr);
    logStep(arr, "end", -1, -1, "Insertion sort complete");
    return 0;
}