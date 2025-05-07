#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>

using namespace std;

void printStep(const vector<int>& arr, const string& message, int depth, int position, const string& action, int pivotIndex = -1, int swapA = -1, int swapB = -1) {
    cout << "{";
    cout << "\"array\": [";
    for (int i = 0; i < arr.size(); ++i) {
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

void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; ++i) {
        for (int j = 0; j < n - i - 1; ++j) {
            printStep(arr, "Comparing " + to_string(arr[j]) + " and " + to_string(arr[j + 1]),
                      1, i * n + j, "compare", -1, j, j + 1);

            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
                printStep(arr, "Swapping " + to_string(arr[j]) + " and " + to_string(arr[j + 1]),
                          1, i * n + j, "swap", -1, j, j + 1);
            } else {
                printStep(arr, "No swap needed", 1, i * n + j, "no-swap", -1, j, j + 1);
            }
        }
    }
}


void selectionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; ++i) {
        int minIdx = i;
        for (int j = i + 1; j < n; ++j) {
            printStep(arr, "Comparing " + to_string(arr[j]) + " with current min " + to_string(arr[minIdx]), 1, 0, "compare", -1, j, minIdx);
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        if (minIdx != i) {
            swap(arr[i], arr[minIdx]);
            printStep(arr, "Swapping " + to_string(arr[i]) + " and " + to_string(arr[minIdx]), 1, 0, "swap", -1, i, minIdx);
        }
    }
}
void insertionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 1; i < n; ++i) {
        int key = arr[i];
        int j = i - 1;

        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            printStep(arr, "Shifting " + to_string(arr[j]) + " to right", 1, i, "shift", -1, j, j + 1);
            j--;
        }
        arr[j + 1] = key;
        printStep(arr, "Inserting " + to_string(key) + " at position " + to_string(j + 1), 1, i, "insert", -1);
    }
}

void countingSort(vector<int>& arr, int depth, int position) {
    int maxVal = *max_element(arr.begin(), arr.end());
    vector<int> count(maxVal + 1, 0);
    vector<int> output(arr.size());

    for (int i = 0; i < arr.size(); i++) {
        count[arr[i]]++;
        printStep(arr, "Counting element " + to_string(arr[i]), depth, position, "count", -1, arr[i], -1);
    }

    for (int i = 1; i <= maxVal; i++) {
        count[i] += count[i - 1];
        printStep(arr, "Building prefix sum at index " + to_string(i), depth, position, "prefix", -1, i, -1);
    }

    for (int i = arr.size() - 1; i >= 0; i--) {
        output[count[arr[i]] - 1] = arr[i];
        count[arr[i]]--;
        printStep(output, "Placing " + to_string(arr[i]) + " at correct position", depth, position, "place", -1, count[arr[i]], i);
    }

    arr = output;
}

int getDigit(int num, int exp) {
    return (num / exp) % 10;
}

void radixSort(vector<int>& arr, int depth, int position) {
    int maxVal = *max_element(arr.begin(), arr.end());
    int exp = 1;

    while (maxVal / exp > 0) {
        vector<int> output(arr.size());
        vector<int> count(10, 0);

        for (int i = 0; i < arr.size(); i++) {
            int digit = getDigit(arr[i], exp);
            count[digit]++;
            printStep(arr, to_string(arr[i]) + " has digit " + to_string(digit) + " at exp " + to_string(exp), depth, position, "digit", -1, digit, i);
        }

        for (int i = 1; i < 10; i++) {
            count[i] += count[i - 1];
            printStep(arr, "Building prefix sum for digit " + to_string(i), depth, position, "prefix", -1, i, -1);
        }

        for (int i = arr.size() - 1; i >= 0; i--) {
            int digit = getDigit(arr[i], exp);
            output[count[digit] - 1] = arr[i];
            count[digit]--;
            printStep(output, "Placing " + to_string(arr[i]) + " based on digit " + to_string(digit), depth, position, "place", -1, count[digit], i);
        }

        arr = output;
        exp *= 10;
    }
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
    } else if (algorithm == "bubble-sort") {
        bubbleSort(arr);
    } else if (algorithm == "selection-sort") {
        selectionSort(arr);
    } else if (algorithm == "insertion-sort") {
        insertionSort(arr);
    }  else if (algorithm == "counting-sort") {
        countingSort(arr, 1, 0);
    } else if (algorithm == "radix-sort") {
        radixSort(arr, 1, 0);
    } else {

    printStep(arr, "Final sorted array", 0, 0, "final");

    return 0;
}
}
