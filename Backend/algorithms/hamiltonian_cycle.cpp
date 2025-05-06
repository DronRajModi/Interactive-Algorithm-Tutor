#include <iostream>
#include <vector>
#include <string>

using namespace std;

void logStep(const vector<vector<int>>& graph, const vector<int>& path, int vertex, const string& message) {
    cout << "{";
    cout << "\"type\":\"Hamiltonian Cycle\", ";
    cout << "\"message\":\"" << message << "\", ";
    cout << "\"graph\":[";

    for (size_t i = 0; i < graph.size(); ++i) {
        cout << "[";
        for (size_t j = 0; j < graph[i].size(); ++j) {
            cout << graph[i][j];
            if (j != graph[i].size() - 1) cout << ", ";
        }
        cout << "]";
        if (i != graph.size() - 1) cout << ", ";
    }

    cout << "], \"path\": [";
    for (size_t i = 0; i < path.size(); ++i) {
        cout << path[i];
        if (i != path.size() - 1) cout << ", ";
    }
    cout << "], \"vertex\": " << vertex;
    cout << "}" << endl;
}

bool isSafe(int v, const vector<vector<int>>& graph, const vector<int>& path, int pos) {
    if (graph[path[pos - 1]][v] == 0) return false;
    for (int i = 0; i < pos; ++i) if (path[i] == v) return false;
    return true;
}

bool hamCycleUtil(const vector<vector<int>>& graph, vector<int>& path, int pos) {
    if (pos == graph.size()) {
        if (graph[path[pos - 1]][path[0]] == 1) {
            logStep(graph, path, -1, "✅ Hamiltonian Cycle found");
            return true;
        } else {
            logStep(graph, path, -1, "No cycle, backtracking");
            return false;
        }
    }

    for (int v = 1; v < graph.size(); ++v) {
        if (isSafe(v, graph, path, pos)) {
            path[pos] = v;
            logStep(graph, path, v, "Trying vertex " + to_string(v));
            if (hamCycleUtil(graph, path, pos + 1)) return true;
            path[pos] = -1;
            logStep(graph, path, v, "Backtracking from vertex " + to_string(v));
        }
    }
    return false;
}

void findHamiltonianCycle(const vector<vector<int>>& graph) {
    vector<int> path(graph.size(), -1);
    path[0] = 0;
    logStep(graph, path, 0, "Starting Hamiltonian cycle search");
    if (!hamCycleUtil(graph, path, 1)) {
        logStep(graph, path, -1, "No Hamiltonian Cycle found");
    }
}

int main(int argc, char* argv[]) {
    vector<vector<int>> graph = {
        {0, 1, 0, 1},
        {1, 0, 1, 1},
        {0, 1, 0, 1},
        {1, 1, 1, 0}
    };

    if (argc > 1) {
        // If graph input is provided, you can handle it here, but it's not covered in this example
    }

    findHamiltonianCycle(graph);
    return 0;
}
