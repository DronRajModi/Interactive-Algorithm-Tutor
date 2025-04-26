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
        cout << arr[i];
        if (i + 1 < arr.size()) cout << ",";
    }

    cout << "],\"message\":\"";

    for (char c : message) {
        if (c == '"') cout << "\\\"";
        else cout << c;
    }

    cout << "\"}" << endl;
    cout.flush();
    sleep_ms(300);
}

int partition(vector<int>& arr, int l, int r) {
    int pivot = arr[r];
    int i = (l - 1);

    for (int j = l; j <= r - 1; j++) {
        logStep(arr, "compare", j, r, "Comparing " + to_string(arr[j]) + " with pivot " + to_string(pivot));
        if (arr[j] <= pivot) {
            i++;
            swap(arr[i], arr[j]);
            logStep(arr, "swap", i, j, "Swapped " + to_string(arr[i]) + " with " + to_string(arr[j]));
            logStep(arr, "merge", min(i,j), max(i,j), "Showing swap range");
        }
    }

    swap(arr[i + 1], arr[r]);
    logStep(arr, "pivot_swap", i + 1, r, "Placed pivot at index " + to_string(i + 1));
    logStep(arr, "merge", i + 1, r, "Pivot placed"); // force cube show
    return (i + 1);
}

void quickSort(vector<int>& arr, int l, int r) {
    if (l < r) {
        int pi = partition(arr, l, r);
        quickSort(arr, l, pi - 1);
        quickSort(arr, pi + 1, r);
    }
}

int main() {
    vector<int> arr = {38, 27, 43, 3, 9, 82, 10};

    logStep(arr, "start", -1, -1, "Starting quick sort");
    quickSort(arr, 0, arr.size() - 1);
    logStep(arr, "end", -1, -1, "Quick sort complete");

    return 0;
}
