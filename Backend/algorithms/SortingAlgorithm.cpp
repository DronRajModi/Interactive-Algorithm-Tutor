#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>

using namespace std;

void printStep(const vector<int>& arr, const string& message, int depth, int position, const string& action, int pivotIndex = -1, int swapA = -1, int swapB = -1) {
    cout << "{";
    cout << "\"array\": [";
    for (size_t i = 0; i < arr.size(); ++i) {
        cout << arr[i];
        if (i < arr.size() - 1) cout << ", ";
    }
    cout << "], ";
    cout << "\"message\": \"" << message << "\", ";
    cout << "\"depth\": " << depth << ", ";
    cout << "\"position\": " << position << ", ";
    cout << "\"action\": \"" << action << "\", ";
    cout << "\"pivotIndex\": " << pivotIndex << ", ";
    cout << "\"swap\": [" << swapA << ", " << swapB << "]";
    cout << "}" << endl;
}

void quickSort(vector<int>& arr, int low, int high, int depth, int position) {
    if (low >= high) {
        if (low == high) {
            printStep(arr, "Single element, no need to sort", depth, position, "base");
        }
        return;
    }

    int pivot = arr[high];
    int i = low - 1;

    printStep(arr, "Selecting pivot " + to_string(pivot) + " at index " + to_string(high), depth, position, "pivot", high);

    for (int j = low; j < high; ++j) {
        if (arr[j] <= pivot) {
            ++i;
            if (i != j) {
                swap(arr[i], arr[j]);
                printStep(arr, "Swapping " + to_string(arr[i]) + " and " + to_string(arr[j]), depth, position, "swap", high, i, j);
            }
        }
    }

    swap(arr[i + 1], arr[high]);
    printStep(arr, "Placing pivot at correct position", depth, position, "pivot-swap", i + 1, high);

    int pivotIndex = i + 1;
    quickSort(arr, low, pivotIndex - 1, depth + 1, position * 2);
    quickSort(arr, pivotIndex + 1, high, depth + 1, position * 2 + 1);
}

void merge(vector<int>& arr, int left, int mid, int right, int depth, int position) {
    vector<int> leftArr(arr.begin() + left, arr.begin() + mid + 1);
    vector<int> rightArr(arr.begin() + mid + 1, arr.begin() + right + 1);

    int i = 0, j = 0, k = left;

    while (i < (int)leftArr.size() && j < (int)rightArr.size()) {
        if (leftArr[i] <= rightArr[j]) arr[k++] = leftArr[i++];
        else arr[k++] = rightArr[j++];
    }

    while (i < (int)leftArr.size()) arr[k++] = leftArr[i++];
    while (j < (int)rightArr.size()) arr[k++] = rightArr[j++];

    vector<int> merged(arr.begin() + left, arr.begin() + right + 1);
    printStep(merged, "Merged from " + to_string(left) + " to " + to_string(right), depth, position, "merge");
}

void mergeSort(vector<int>& arr, int left, int right, int depth, int position) {
    if (left == right) {
        vector<int> singleElement = { arr[left] };
        printStep(singleElement, "An array of length 1 cannot be split, ready for merge", depth, position, "base");
        return;
    }

    int mid = left + (right - left) / 2;

    vector<int> current(arr.begin() + left, arr.begin() + right + 1);
    printStep(current, "Splitting", depth, position, "split");

    mergeSort(arr, left, mid, depth + 1, position * 2);
    mergeSort(arr, mid + 1, right, depth + 1, position * 2 + 1);
    merge(arr, left, mid, right, depth, position);
}

vector<int> parseInput(int argc, char* argv[], int startIndex) {
    vector<int> arr;
    for (int i = startIndex; i < argc; ++i) {
        arr.push_back(stoi(argv[i]));
    }
    return arr;
}

int main(int argc, char* argv[]) {
    if (argc < 2) {
        cerr << "Algorithm name required.\n";
        return 1;
    }

    string algorithm = argv[1];
    vector<int> arr;

    if (argc > 2) arr = parseInput(argc, argv, 2);
    else arr = { 7, 8, 9, 4, 80, 60, 78, 49 }; // default

    printStep(arr, "Initial array", 0, 0, "initial");

    if (algorithm == "merge-sort") {
        mergeSort(arr, 0, arr.size() - 1, 1, 0);
    } else if (algorithm == "quick-sort") {
        quickSort(arr, 0, arr.size() - 1, 1, 0);
    } else {
        cerr << "Unknown algorithm: " << algorithm << endl;
        return 1;
    }

    printStep(arr, "Final sorted array", 0, 0, "final");

    return 0;
}
