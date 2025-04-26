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

void heapify(vector<int>& arr, int n, int i) {
    int largest = i;
    int l = 2*i + 1, r = 2*i + 2;
    if (l < n) {
        logStep(arr, "compare", l, largest,
                "Comparing child " + to_string(arr[l]) + " with " + to_string(arr[largest]));
        if (arr[l] > arr[largest]) largest = l;
    }
    if (r < n) {
        logStep(arr, "compare", r, largest,
                "Comparing child " + to_string(arr[r]) + " with " + to_string(arr[largest]));
        if (arr[r] > arr[largest]) largest = r;
    }
    if (largest != i) {
        swap(arr[i], arr[largest]);
        logStep(arr, "swap", i, largest,
                "Swapped " + to_string(arr[i]) + " and " + to_string(arr[largest]));
        heapify(arr, n, largest);
    }
}

void heapSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = n/2 - 1; i >= 0; --i) heapify(arr, n, i);
    for (int i = n - 1; i > 0; --i) {
        swap(arr[0], arr[i]);
        logStep(arr, "swap", 0, i,
                "Swapped root with index " + to_string(i));
        heapify(arr, i, 0);
    }
}

int main() {
    vector<int> arr = {38,27,43,3,9,82,10};
    logStep(arr, "start", -1, -1, "Starting heap sort");
    heapSort(arr);
    logStep(arr, "end", -1, -1, "Heap sort complete");
    return 0;
}