#include <iostream>
#include <vector>
#include <string>

using namespace std;

void printStep(int i, int w, const string& decision, int currentValue, const vector<vector<int>>& dp) {
    cout << "{";
    cout << "\"step\": " << i << ", ";
    cout << "\"weight\": " << w << ", ";
    cout << "\"decision\": \"" << decision << "\", ";
    cout << "\"currentValue\": " << currentValue << ", ";
    cout << "\"dpRow\": [";
    for (int j = 0; j < dp[i].size(); ++j) {
        cout << dp[i][j];
        if (j < dp[i].size() - 1) cout << ", ";
    }
    cout << "]";
    cout << "}" << endl;
}

int knapsack(int W, const vector<int>& weights, const vector<int>& values) {
    int n = weights.size();
    vector<vector<int>> dp(n, vector<int>(W , 0));

    for (int i = 1; i <= n; ++i) {
        for (int w = 0; w <= W; ++w) {
            if (weights[i - 1] <= w) {
                int include = values[i - 1] + dp[i - 1][w - weights[i - 1]];
                int exclude = dp[i - 1][w];
                dp[i][w] = max(include, exclude);
                printStep(i, w, (include > exclude ? "include" : "exclude"), dp[i][w], dp);
            } else {
                dp[i][w] = dp[i - 1][w];
                printStep(i, w, "exclude", dp[i][w], dp);
            }
        }
    }

    cout << "{\"finalValue\": " << dp[n][W] << "}" << endl;
    return dp[n][W];
}

vector<int> parseArgs(int argc, char* argv[], int start, int count) {
    vector<int> result;
    for (int i = start; i < start + count && i < argc; ++i) {
        result.push_back(stoi(argv[i]));
    }
    return result;
}

int main(int argc, char* argv[]) {
    int W = 10;
    vector<int> weights = {2, 3, 4, 5};
    vector<int> values = {3, 4, 5, 6};

    if (argc > 3) {
        W = stoi(argv[1]);
        int itemCount = stoi(argv[2]);
        if (argc >= 3 + 2 * itemCount) {
            weights = parseArgs(argc, argv, 3, itemCount);
            values = parseArgs(argc, argv, 3 + itemCount, itemCount);
        } else {
            cerr << " Not enough arguments for weights and values." << endl;
            return 1;
        }
    }
    cout << "{\"action\": \"start\", \"maxWeight\": " << W << ", \"items\": " << weights.size() << "}" << endl;
    knapsack(W, weights, values);
    cout << "{\"action\": \"end\"}" << endl;
    return 0;
}