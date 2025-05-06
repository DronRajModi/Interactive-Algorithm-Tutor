#include <iostream>
#include <vector>
#include <queue>
#include <sstream>
#include <string>
#include <limits>
#include <unordered_map>
#include <unordered_set>
#include <set>
#include <algorithm>

using namespace std;

struct Edge {
    int to;
    int weight;
};

using Graph = unordered_map<int, vector<Edge>>;

void printStep(const string& type, int node, int value, const string& explanation) {
    cout << "{\"type\":\"" << type << "\",\"node\":" << node
         << ",\"value\":" << value << ",\"explanation\":\"" << explanation << "\"}" << endl;
}

void printFinalPath(const vector<int>& path, int cost) {
    ostringstream oss;
    for (size_t i = 0; i < path.size(); ++i) {
        oss << path[i];
        if (i + 1 < path.size()) oss << "->";
    }
    cout << "{\"type\":\"final\",\"path\":\"" << oss.str()
         << "\",\"cost\":" << cost << ",\"explanation\":\"Shortest path found with total cost " << cost << "\"}" << endl;
}

void printFinalMST(int cost, const vector<pair<int, int>>& edges) {
    ostringstream oss;
    for (const auto& [u, v] : edges) {
        oss << "(" << u << "-" << v << ") ";
    }
    cout << "{\"type\":\"final\",\"mst\":\"" << oss.str()
         << "\",\"cost\":" << cost << ",\"explanation\":\"MST complete with total cost " << cost << "\"}" << endl;
}

void printInit(const Graph& graph) {
    set<int> nodes;
    vector<tuple<int, int, int>> edges;

    for (const auto& [u, neighbors] : graph) {
        nodes.insert(u);
        for (const auto& edge : neighbors) {
            int v = edge.to;
            int w = edge.weight;
            if (u < v) { // avoid duplicates
                edges.emplace_back(u, v, w);
            }
            nodes.insert(v);
        }
    }

    cout << "{\"type\":\"init\",\"nodes\":[";
    int count = 0;
    for (int node : nodes) {
        cout << node;
        if (++count < nodes.size()) cout << ",";
    }
    cout << "],\"edges\":[";

    for (size_t i = 0; i < edges.size(); ++i) {
        auto [u, v, w] = edges[i];
        cout << "{\"from\":" << u << ",\"to\":" << v << ",\"weight\":" << w << "}";
        if (i + 1 < edges.size()) cout << ",";
    }
    cout << "]}" << endl;
}

Graph buildGraphFromArgs(int argc, char* argv[], int startIndex) {
    Graph graph;

    if ((argc - startIndex) % 3 != 0) {
        cerr << "{\"type\":\"error\",\"message\":\"Invalid number of arguments. Expected triplets of u v w for edges.\"}" << endl;
        exit(1);
    }

    try {
        for (int i = startIndex; i + 2 < argc; i += 3) {
            int u = stoi(argv[i]);
            int v = stoi(argv[i + 1]);
            int w = stoi(argv[i + 2]);
            graph[u].push_back({v, w});
            graph[v].push_back({u, w});
        }
    } catch (const exception& e) {
        cerr << "{\"type\":\"error\",\"message\":\"Failed to parse edge input: " << e.what() << "\"}" << endl;
        exit(1);
    }

    return graph;
}

Graph buildDefaultGraph() {
    Graph graph;
    graph[0] = { {1, 4}, {2, 1} };
    graph[1] = { {0, 4}, {2, 2}, {3, 5} };
    graph[2] = { {0, 1}, {1, 2}, {3, 8} };
    graph[3] = { {1, 5}, {2, 8} };
    return graph;
}

void runDijkstra(const Graph& graph, int start = 0, int end = 3) {
    printInit(graph);

    unordered_map<int, int> dist, prev;
    unordered_set<int> visited;

    for (const auto& [node, _] : graph)
        dist[node] = numeric_limits<int>::max();
    dist[start] = 0;

    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> pq;
    pq.push({0, start});

    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;
        if (visited.count(u)) continue;
        visited.insert(u);

        printStep("visit", u, d, "Visiting node " + to_string(u));

        for (const auto& edge : graph.at(u)) {
            int v = edge.to, w = edge.weight;
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                prev[v] = u;
                pq.push({dist[v], v});
                printStep("update", v, dist[v], "Updated distance of node " + to_string(v));
            }
        }
    }

    vector<int> path;
    int current = end;
    if (prev.find(current) == prev.end() && current != start) {
        cout << "{\"type\":\"final\",\"explanation\":\"No path to node " << end << "\"}" << endl;
        return;
    }

    while (current != start) {
        path.push_back(current);
        current = prev[current];
    }
    path.push_back(start);
    reverse(path.begin(), path.end());

    printFinalPath(path, dist[end]);
}

void runPrims(const Graph& graph, int start = 0) {
    printInit(graph);

    unordered_map<int, bool> inMST;
    unordered_map<int, int> key, parent;
    for (const auto& [node, _] : graph)
        key[node] = numeric_limits<int>::max();
    key[start] = 0;

    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> pq;
    pq.push({0, start});

    vector<pair<int, int>> mstEdges;
    int totalCost = 0;

    while (!pq.empty()) {
        auto [cost, u] = pq.top(); pq.pop();
        if (inMST[u]) continue;

        inMST[u] = true;
        totalCost += cost;
        printStep("include", u, cost, "Added node " + to_string(u) + " to MST");

        if (u != start) mstEdges.emplace_back(parent[u], u);

        for (const auto& edge : graph.at(u)) {
            int v = edge.to, w = edge.weight;
            if (!inMST[v] && w < key[v]) {
                key[v] = w;
                parent[v] = u;
                pq.push({w, v});
                printStep("update", v, w, "Updated key of node " + to_string(v));
            }
        }
    }

    printFinalMST(totalCost, mstEdges);
}

void printEnd() {
    cout << "{\"type\":\"end\"}" << endl;
}

int main(int argc, char* argv[]) {
    if (argc < 2) {
        cerr << "{\"type\":\"error\",\"message\":\"Usage: <algorithm> [graph edges...]\"}" << endl;
        return 1;
    }

    string algo = argv[1];

    Graph graph;
    if (argc == 2 || (argc == 3 && string(argv[2]) == "0")) {
        graph = buildDefaultGraph();
    } else {
        graph = buildGraphFromArgs(argc, argv, 2);
    }

    if (algo == "dijkstra") {
        runDijkstra(graph, 0, 3);
    } else if (algo == "prims") {
        runPrims(graph);
    } else {
        cerr << "{\"type\":\"error\",\"message\":\"Unknown algorithm: " << algo << "\"}" << endl;
        return 1;
    }

    printEnd();
    return 0;
}
