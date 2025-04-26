#include <iostream>
#include <vector>
#include <thread>
#include <chrono>
#include <string>
#include <algorithm>
#include <sstream>
using namespace std;

void sleep_ms(int ms) {
    this_thread::sleep_for(chrono::milliseconds(ms));
}

void logStep(const vector<int>& arr, const string& type, int l = -1, int r = -1) {
    ostringstream ss;
    ss << "{\"type\":\"" << type << "\"";
    if (l >= 0) ss << ",\"l\":" << l;
    if (r >= 0) ss << ",\"r\":" << r;
    ss << ",\"array\":[";
    for (size_t i = 0; i < arr.size(); ++i) {
        ss << arr[i] << (i + 1 < arr.size() ? "," : "");
    }
    ss << "]}";
    cout << ss.str() << "\n" << flush;
    sleep_ms(500);
}

void merge(vector<int>& arr, int l, int m, int r) {
    logStep(arr, "merge", l, r);
    int n1 = m - l + 1, n2 = r - m;
    vector<int> L(arr.begin() + l, arr.begin() + m + 1);
    vector<int> R(arr.begin() + m + 1, arr.begin() + r + 1);
    int i = 0, j = 0, k = l;
    while (i < n1 && j < n2) {
        logStep(arr, "compare", k);
        if (L[i] <= R[j]) arr[k++] = L[i++];
        else              arr[k++] = R[j++];
        logStep(arr, "write", k - 1);
    }
    while (i < n1) { arr[k++] = L[i++]; logStep(arr, "left_rem", k - 1); }
    while (j < n2) { arr[k++] = R[j++]; logStep(arr, "right_rem", k - 1); }
}

void mergeSort(vector<int>& arr, int l, int r) {
    if (l >= r) return;
    logStep(arr, "split", l, r);
    int m = l + (r - l) / 2;
    mergeSort(arr, l, m);
    mergeSort(arr, m + 1, r);
    merge(arr, l, m, r);
}

int main() {
    vector<int> arr = {38, 27, 43, 3, 9, 82, 10};
    mergeSort(arr, 0, arr.size() - 1);
    logStep(arr, "end");
    return 0;
}
