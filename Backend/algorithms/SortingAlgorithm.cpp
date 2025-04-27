#include <iostream>
#include <vector>
#include <thread>
#include <chrono>
#include <string>
#include <algorithm>

using namespace std;

// Utility functions
void sleep_ms(int ms) {
    this_thread::sleep_for(chrono::milliseconds(ms));
}

void logStep(const vector<int>& arr, const string& type,
             int l = -1, int r = -1, const string& message = "") {
    cout << "{";
    cout << "\"type\":\"" << type << "\"";
    if (l >= 0) cout << ",\"l\":" << l;
    if (r >= 0) cout << ",\"r\":" << r;
    cout << ",\"array\":[";
    for (size_t i = 0; i < arr.size(); ++i)
        cout << arr[i] << (i + 1 < arr.size() ? "," : "");
    cout << "],\"message\":\"";
    for (char c : message) {
        if (c == '"') cout << "\\\""; else cout << c;
    }
    cout << "\"}" << endl;
    cout.flush();
    sleep_ms(200);  // slight delay between steps
}

// Insertion Sort
void insertionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 1; i < n; ++i) {
        int key = arr[i], j = i - 1;
        logStep(arr, "key", i, -1, "Key = " + to_string(key));
        while (j >= 0 && arr[j] > key) {
            logStep(arr, "compare", j, i, "Comparing " + to_string(arr[j]) + " and key");
            arr[j + 1] = arr[j];
            logStep(arr, "shift", j, j + 1, "Shifted " + to_string(arr[j]) + " to position " + to_string(j + 1));
            --j;
        }
        arr[j + 1] = key;
        logStep(arr, "insert", j + 1, -1, "Inserted key at position " + to_string(j + 1));
    }
}

// Merge Sort
void merge(vector<int>& arr, int l, int m, int r) {
    logStep(arr, "merge", l, r, "Merging " + to_string(l) + " to " + to_string(r));
    int n1 = m - l + 1, n2 = r - m;
    vector<int> L(arr.begin() + l, arr.begin() + m + 1);
    vector<int> R(arr.begin() + m + 1, arr.begin() + r + 1);
    int i = 0, j = 0, k = l;
    while (i < n1 && j < n2) {
        logStep(arr, "compare", k, -1, "Comparing " + to_string(L[i]) + " and " + to_string(R[j]));
        arr[k++] = (L[i] <= R[j]) ? L[i++] : R[j++];
        logStep(arr, "write", k - 1, -1, "Wrote at position " + to_string(k - 1));
    }
    while (i < n1) {
        arr[k++] = L[i++];
    }
    while (j < n2) {
        arr[k++] = R[j++];
    }
}
void mergeSort(vector<int>& arr, int l, int r) {
    if (l < r) {
        int m = l + (r - l) / 2;
        mergeSort(arr, l, m);
        mergeSort(arr, m + 1, r);
        merge(arr, l, m, r);
    }
}

// Quick Sort
int partition(vector<int>& arr, int l, int r) {
    int pivot = arr[r], i = l - 1;
    for (int j = l; j < r; ++j) {
        logStep(arr, "compare", j, r, "Comparing " + to_string(arr[j]) + " with pivot " + to_string(pivot));
        if (arr[j] <= pivot) {
            ++i;
            swap(arr[i], arr[j]);
            logStep(arr, "swap", i, j, "Swapped " + to_string(arr[i]) + " and " + to_string(arr[j]));
        }
    }
    swap(arr[i + 1], arr[r]);
    logStep(arr, "pivot_swap", i + 1, r, "Placed pivot at position " + to_string(i + 1));
    return i + 1;
}
void quickSort(vector<int>& arr, int l, int r) {
    if (l < r) {
        int pi = partition(arr, l, r);
        quickSort(arr, l, pi - 1);
        quickSort(arr, pi + 1, r);
    }
}

// Radix Sort
void countingSortByDigit(vector<int>& arr, int exp) {
    int n = arr.size();
    vector<int> output(n), count(10, 0);
    for (int x : arr) count[(x / exp) % 10]++;
    for (int i = 1; i < 10; ++i) count[i] += count[i - 1];
    for (int i = n - 1; i >= 0; --i) output[--count[(arr[i] / exp) % 10]] = arr[i];
    arr = output;
    logStep(arr, "counting_sort", -1, -1, "Counting sort pass completed");
}
void radixSort(vector<int>& arr) {
    int mx = *max_element(arr.begin(), arr.end());
    for (int exp = 1; mx / exp > 0; exp *= 10) {
        countingSortByDigit(arr, exp);
    }
}

// Selection Sort
void selectionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; ++i) {
        int minIdx = i;
        for (int j = i + 1; j < n; ++j) {
            logStep(arr, "compare", j, minIdx, "Comparing " + to_string(arr[j]) + " and " + to_string(arr[minIdx]));
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        swap(arr[i], arr[minIdx]);
        logStep(arr, "swap", i, minIdx, "Swapped " + to_string(arr[i]) + " and " + to_string(arr[minIdx]));
    }
}

// Bubble Sort
void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n-1; ++i)
        for (int j = 0; j < n-i-1; ++j) {
            logStep(arr, "compare", j, j+1, "Comparing " + to_string(arr[j]) + " and " + to_string(arr[j+1]));
            if (arr[j] > arr[j+1]) {
                swap(arr[j], arr[j+1]);
                logStep(arr, "swap", j, j+1, "Swapped " + to_string(arr[j]) + " and " + to_string(arr[j+1]));
            }
        }
}

// Heap Sort
void heapify(vector<int>& arr, int n, int i) {
    int largest = i, l = 2*i+1, r = 2*i+2;
    if (l < n && arr[l] > arr[largest]) largest = l;
    if (r < n && arr[r] > arr[largest]) largest = r;
    if (largest != i) {
        swap(arr[i], arr[largest]);
        logStep(arr, "swap", i, largest, "Heapify swap " + to_string(arr[i]) + " and " + to_string(arr[largest]));
        heapify(arr, n, largest);
    }
}
void heapSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = n/2-1; i >= 0; --i) heapify(arr, n, i);
    for (int i = n-1; i >= 0; --i) {
        swap(arr[0], arr[i]);
        logStep(arr, "swap", 0, i, "Moved max to end " + to_string(arr[i]));
        heapify(arr, i, 0);
    }
}

// Shell Sort
void shellSort(vector<int>& arr) {
    int n = arr.size();
    for (int gap = n/2; gap > 0; gap /= 2) {
        for (int i = gap; i < n; ++i) {
            int temp = arr[i], j;
            for (j = i; j >= gap && arr[j-gap] > temp; j -= gap) {
                logStep(arr, "compare", j, j-gap, "Compare and shift " + to_string(arr[j-gap]));
                arr[j] = arr[j-gap];
            }
            arr[j] = temp;
            logStep(arr, "insert", j, -1, "Inserted at position " + to_string(j));
        }
    }
}

// Main
int main() {
    vector<int> arr = {38, 27, 43, 3, 9, 82, 10};

    cout << "Choose sorting algorithm:\n";
    cout << "1. Insertion Sort\n2. Merge Sort\n3. Quick Sort\n4. Radix Sort\n5. Selection Sort\n6. Bubble Sort\n7. Heap Sort\n8. Shell Sort\n";
    
    int choice;
    cin >> choice;
    
    if (choice < 1 || choice > 8) {
        cout << "Invalid choice!" << endl;
        return 1;
    }

    logStep(arr, "start", -1, -1, "Starting sort");

    switch (choice) {
        case 1: insertionSort(arr); break;
        case 2: mergeSort(arr, 0, arr.size()-1); break;
        case 3: quickSort(arr, 0, arr.size()-1); break;
        case 4: radixSort(arr); break;
        case 5: selectionSort(arr); break;
        case 6: bubbleSort(arr); break;
        case 7: heapSort(arr); break;
        case 8: shellSort(arr); break;
    }

    logStep(arr, "end", -1, -1, "Sorting complete");

    return 0;
}
