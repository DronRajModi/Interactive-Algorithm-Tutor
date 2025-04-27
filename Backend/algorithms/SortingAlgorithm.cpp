#include <iostream>
#include <vector>
#include <thread>
#include <chrono>
#include <string>
#include <algorithm>

using namespace std;
typedef vector<int> vi;

// Utility: pause for animation
void sleep_ms(int ms) {
    this_thread::sleep_for(chrono::milliseconds(ms));
}

// JSON logger for each step
void logStep(const vi &arr,
             const string &type,
             int l = -1, int r = -1,
             const string &message = "") {
    cout << "{";
    cout << "\"type\":\"" << type << "\"";
    if (l >= 0) cout << ",\"l\":" << l;
    if (r >= 0) cout << ",\"r\":" << r;
    cout << ",\"array\": [";
    for (size_t i = 0; i < arr.size(); ++i)
        cout << arr[i] << (i + 1 < arr.size() ? "," : "");
    cout << "], \"message\":\"";
    for (char c : message) {
        if (c == '"') cout << "\\\"";
        else cout << c;
    }
    cout << "\"}" << endl;
    cout.flush();
    sleep_ms(150);
}

// Explicit split logger for Merge Sort
void logSplit(const vi &arr, int l, int m, int r) {
    cout << "{";
    cout << "\"type\":\"split\"";
    cout << ",\"l\":" << l;
    cout << ",\"m\":" << m;
    cout << ",\"r\":" << r;
    cout << ",\"left\": [";
    for (int i = l; i <= m; ++i)
        cout << arr[i] << (i < m ? "," : "");
    cout << "], ";
    cout << "\"right\": [";
    for (int i = m + 1; i <= r; ++i)
        cout << arr[i] << (i < r ? "," : "");
    cout << "], \"message\":\"Split [" << l << "," << r << "]\"}" << endl;
    cout.flush(); sleep_ms(150);
}

// Summary of partition for Quick Sort
void logPartitionSummary(const vi &arr, int l, int p, int r) {
    cout << "{";
    cout << "\"type\":\"partition\"";
    cout << ",\"l\":" << l;
    cout << ",\"pivotIndex\":" << p;
    cout << ",\"r\":" << r;
    cout << ",\"left\": [";
    for (int i = l; i < p; ++i)
        cout << arr[i] << (i + 1 < p ? "," : "");
    cout << "], ";
    cout << "\"pivot\": " << arr[p] << ", ";
    cout << "\"right\": [";
    for (int i = p + 1; i <= r; ++i)
        cout << arr[i] << (i < r ? "," : "");
    cout << "], \"message\":\"Partitioned\"}" << endl;
    cout.flush(); sleep_ms(150);
}

// Merge Sort
void merge(vector<int>& arr, int l, int m, int r) {
    logStep(arr, "merge_start", l, r, "Start merge");
    int n1 = m - l + 1, n2 = r - m;
    vi L(arr.begin() + l, arr.begin() + m + 1);
    vi R(arr.begin() + m + 1, arr.begin() + r + 1);
    int i = 0, j = 0, k = l;
    while (i < n1 && j < n2) {
        logStep(arr, "compare", l + i, m + 1 + j, "Compare L vs R");
        if (L[i] <= R[j]) {
            arr[k] = L[i++];
            logStep(arr, "write", k, -1, "Write from left");
        } else {
            arr[k] = R[j++];
            logStep(arr, "write", k, -1, "Write from right");
        }
        ++k;
    }
    while (i < n1) {
        arr[k] = L[i++];
        logStep(arr, "write", k, -1, "Leftover left"); ++k;
    }
    while (j < n2) {
        arr[k] = R[j++];
        logStep(arr, "write", k, -1, "Leftover right"); ++k;
    }
    logStep(arr, "merge_end", l, r, "Finished merge");
}

void mergeSort(vector<int>& arr, int l, int r) {
    if (l >= r) return;
    int m = l + (r - l) / 2;
    logSplit(arr, l, m, r);
    mergeSort(arr, l, m);
    mergeSort(arr, m + 1, r);
    merge(arr, l, m, r);
}

// Quick Sort
int partition(vector<int>& arr, int l, int r) {
    int pivot = arr[r];
    logStep(arr, "pivot_pick", r, -1, "Pivot=" + to_string(pivot));
    int i = l - 1;
    for (int j = l; j < r; ++j) {
        logStep(arr, "compare", j, r, "Compare <= pivot");
        if (arr[j] <= pivot) {
            ++i; swap(arr[i], arr[j]);
            logStep(arr, "swap", i, j, "Swap for partition");
        }
    }
    swap(arr[i + 1], arr[r]);
    logStep(arr, "swap", i + 1, r, "Place pivot");
    return i + 1;
}

void quickSort(vector<int>& arr, int l, int r) {
    if (l < r) {
        int p = partition(arr, l, r);
        logPartitionSummary(arr, l, p, r);
        quickSort(arr, l, p - 1);
        quickSort(arr, p + 1, r);
    }
}

// Insertion Sort\


void insertionSort(vi& arr) {
    int n = arr.size();
    for (int i = 1; i < n; ++i) {
        int key = arr[i];
        logStep(arr, "key_pick", i, -1, "Key=" + to_string(key));
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            logStep(arr, "compare", j, i, "Compare > key");
            arr[j + 1] = arr[j];
            logStep(arr, "move", j, j + 1, "Shift right");
            --j;
        }
        arr[j + 1] = key;
        logStep(arr, "insert", j + 1, -1, "Insert key");
    }
}

// Selection Sort
void selectionSort(vi& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; ++i) {
        int minIdx = i;
        for (int j = i + 1; j < n; ++j) {
            logStep(arr, "compare", j, minIdx, "Compare");
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        swap(arr[i], arr[minIdx]);
        logStep(arr, "swap", i, minIdx, "Swap");
    }
}

// Bubble Sort
void bubbleSort(vi& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; ++i) {
        for (int j = 0; j < n - i - 1; ++j) {
            logStep(arr, "compare", j, j + 1, "Compare");
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
                logStep(arr, "swap", j, j + 1, "Swap");
            }
        }
    }
}

// Heap Sort
void heapify(vi& arr, int n, int i) {
    int largest = i;
    int l = 2 * i + 1, r = 2 * i + 2;
    if (l < n && arr[l] > arr[largest]) largest = l;
    if (r < n && arr[r] > arr[largest]) largest = r;
    if (largest != i) {
        swap(arr[i], arr[largest]);
        logStep(arr, "heapify_swap", i, largest, "Heapify swap");
        heapify(arr, n, largest);
    }
}

void heapSort(vi& arr) {
    int n = arr.size();
    for (int i = n / 2 - 1; i >= 0; --i) heapify(arr, n, i);
    for (int i = n - 1; i > 0; --i) {
        swap(arr[0], arr[i]);
        logStep(arr, "heap_swap", 0, i, "Move max to end");
        heapify(arr, i, 0);
    }
}

// Shell Sort
void shellSort(vi& arr) {
    int n = arr.size();
    for (int gap = n / 2; gap > 0; gap /= 2) {
        for (int i = gap; i < n; ++i) {
            int temp = arr[i];
            int j = i;
            while (j >= gap && arr[j - gap] > temp) {
                logStep(arr, "compare", j, j - gap, "Compare");
                arr[j] = arr[j - gap];
                logStep(arr, "move", j - gap, j, "Shift");
                j -= gap;
            }
            arr[j] = temp;
            logStep(arr, "insert_gap", j, -1, "Insert at gap");
        }
    }
}

// Radix Sort
void countingSortByDigit(vi &arr, int exp) {
    int n = arr.size();
    vi output(n);
    vector<int> count(10, 0);
    for (int i = 0; i < n; ++i) count[(arr[i] / exp) % 10]++;
    for (int i = 1; i < 10; ++i) count[i] += count[i - 1];
    for (int i = n - 1; i >= 0; --i) {
        output[--count[(arr[i] / exp) % 10]] = arr[i];
    }
    arr = output;
    logStep(arr, "count_sort_pass", -1, -1, "Digit exp=" + to_string(exp));
}

void radixSort(vi &arr) {
    int mx = *max_element(arr.begin(), arr.end());
    for (int exp = 1; mx / exp > 0; exp *= 10) countingSortByDigit(arr, exp);
}

// Parse comma-separated integers
vi parseArray(const string& s) {
    vi out;
    size_t i = 0, j;
    while ((j = s.find(',', i)) != string::npos) {
        out.push_back(stoi(s.substr(i, j - i)));
        i = j + 1;
    }
    if (i < s.size()) out.push_back(stoi(s.substr(i)));
    return out;
}

int main(int argc, char *argv[]) {
    if (argc < 2) {
        cerr << "Error: specify algorithm (e.g. merge-sort)\n";
        return 1;
    }
    string algo = argv[1];
    vi arr = {38,27,43,3,9,82,10};
    if (argc >= 3) arr = parseArray(argv[2]);

    logStep(arr, "start", -1, -1, "Starting " + algo);
    if (algo == "merge-sort")
        mergeSort(arr, 0, arr.size() - 1);
    else if (algo == "quick-sort")
        quickSort(arr, 0, arr.size() - 1);
    else if (algo == "insertion-sort")
        insertionSort(arr);
    else if (algo == "selection-sort")
        selectionSort(arr);
    else if (algo == "bubble-sort")
        bubbleSort(arr);
    else if (algo == "heap-sort")
        heapSort(arr);
    else if (algo == "shell-sort")
        shellSort(arr);
    else if (algo == "radix-sort")
        radixSort(arr);
    else {
        cerr << "Error: unknown algorithm '" << algo << "'\n";
        return 1;
    }
    logStep(arr, "end", -1, -1, "Sorting complete");
    return 0;
}
