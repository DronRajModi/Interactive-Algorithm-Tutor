#include <iostream>
#include <vector>
#include <thread>
#include <chrono>
#include <string>
using namespace std;

void sleep_ms(int ms) {
    this_thread::sleep_for(chrono::milliseconds(ms));
}

void logStep(const vector<int>& arr,
             const string& type,
             int l = -1,
             int r = -1,
             const string& message = "")
{
    cout << "{";
    cout << "\"type\":\"" << type << "\"";
    if (l >= 0) cout << ",\"l\":" << l;
    if (r >= 0) cout << ",\"r\":" << r;
    cout << ",\"array\":[";
    for (size_t i = 0; i < arr.size(); ++i) {
        cout << arr[i] << (i + 1 < arr.size() ? "," : "");
    }
    cout << "],\"message\":\"";
    for (char c : message) {
        if (c == '"') cout << "\\\"";
        else           cout << c;
    }
    cout << "\"}" << endl;
    cout.flush();
    sleep_ms(300);
}

void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; ++i) {
        for (int j = 0; j < n - i - 1; ++j) {
            logStep(arr, "compare", j, j + 1,
                    "Comparing " + to_string(arr[j]) + " and " + to_string(arr[j + 1]));
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
                logStep(arr, "swap", j, j + 1,
                        "Swapped " + to_string(arr[j]) + " and " + to_string(arr[j + 1]));
            }
        }
    }
}

int main() {
    vector<int> arr = {38, 27, 43, 3, 9, 82, 10};
    logStep(arr, "start", -1, -1, "Starting bubble sort");
    bubbleSort(arr);
    logStep(arr, "end", -1, -1, "Bubble sort complete");
    return 0;
}