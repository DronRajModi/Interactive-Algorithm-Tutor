// backend/algorithms/mergeSort.cpp

#include <iostream>
#include <vector>
#include <thread>
#include <chrono>
#include <string>
using namespace std;

// convenience sleep
void sleep_ms(int ms) {
    this_thread::sleep_for(chrono::milliseconds(ms));
}

// logStep now takes an extra message parameter
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
    cout << "]";

    // include message
    cout << ",\"message\":\"";
    // escape quotes in message
    for (char c : message) {
        if (c == '"') cout << "\\\"";
        else           cout << c;
    }
    cout << "\"}";

    cout << endl;
    cout.flush();
    sleep_ms(300);
}

void merge(vector<int>& arr, int l, int m, int r) {
    logStep(arr, "merge", l, r,
            "Merging from " + to_string(l) + " to " + to_string(r));

    int n1 = m - l + 1, n2 = r - m;
    vector<int> L(arr.begin()+l, arr.begin()+m+1);
    vector<int> R(arr.begin()+m+1, arr.begin()+r+1);

    int i = 0, j = 0, k = l;
    while (i < n1 && j < n2) {
        logStep(arr, "compare", k, -1,
                "Comparing " + to_string(L[i]) + " and " + to_string(R[j]));
        arr[k++] = (L[i] <= R[j] ? L[i++] : R[j++]);
        logStep(arr, "write", k-1, -1,
                "Wrote " + to_string(arr[k-1]) + " at index " + to_string(k-1));
    }
    while (i < n1) {
        arr[k++] = L[i++];
        logStep(arr, "left_rem", k-1, -1,
                "Copied remaining left value " + to_string(arr[k-1]) +
                " at index " + to_string(k-1));
    }
    while (j < n2) {
        arr[k++] = R[j++];
        logStep(arr, "right_rem", k-1, -1,
                "Copied remaining right value " + to_string(arr[k-1]) +
                " at index " + to_string(k-1));
    }
}

void mergeSort(vector<int>& arr, int l, int r) {
    if (l >= r) return;
    logStep(arr, "split", l, r,
            "Splitting from " + to_string(l) + " to " + to_string(r));
    int m = l + (r - l) / 2;
    mergeSort(arr, l, m);
    mergeSort(arr, m + 1, r);
    merge(arr, l, m, r);
}

int main() {
    vector<int> arr = {38,27,43,3,9,82,10};

    logStep(arr, "start", -1, -1, "Starting merge sort");
    mergeSort(arr, 0, arr.size() - 1);
    logStep(arr, "end", -1, -1, "Merge sort complete");

    return 0;
}
