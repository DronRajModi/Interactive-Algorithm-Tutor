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

// step counter for uniform logging
static int STEP = 0;

void printStep(const string& type, int a, int b, const string& explanation) {
    // `a` is node or u, `b` is value or v depending on type
    cout << "{"
         << "\"step\":" << STEP++ << ","
         << "\"type\":\"" << type << "\","
         << "\"a\":" << a << ","
         << "\"b\":" << b << ","
         << "\"explanation\":\"" << explanation << "\""
         << "}" << endl;
}

void printFinalPath(const vector<int>& path, int cost) {
    ostringstream oss;
    for (size_t i = 0; i < path.size(); ++i) {
        oss << path[i];
        if (i + 1 < path.size()) oss << "->";
    }
    cout << "{"
         << "\"step\":" << STEP++ << ","
         << "\"type\":\"final\","
         << "\"path\":\"" << oss.str() << "\","
         << "\"cost\":" << cost << ","
         << "\"explanation\":\"Shortest path found with total cost " << cost << "\""
         << "}" << endl;
}

void printFinalMST(int cost, const vector<pair<int, int>>& edges) {
    ostringstream oss;
    for (const auto& [u, v] : edges) {
        oss << "(" << u << "-" << v << ") ";
    }
    cout << "{"
         << "\"step\":" << STEP++ << ","
         << "\"type\":\"final\","
         << "\"mst\":\"" << oss.str() << "\","
         << "\"cost\":" << cost << ","
         << "\"explanation\":\"MST complete with total cost " << cost << "\""
         << "}" << endl;
}

void printInit(const Graph& graph) {
    set<int> nodes;
    vector<tuple<int, int, int>> edges;

    for (const auto& [u, neighbors] : graph) {
        nodes.insert(u);
        for (const auto& edge : neighbors) {
            int v = edge.to, w = edge.weight;
            if (u < v) edges.emplace_back(u, v, w);
            nodes.insert(v);
        }
    }

    cout << "{"
         << "\"step\":" << STEP++ << ","
         << "\"type\":\"init\","
         << "\"nodes\":[";
    int cnt = 0;
    for (int n : nodes) {
        cout << n << (++cnt < (int)nodes.size() ? "," : "");
    }
    cout << "],\"edges\":[";
    for (size_t i = 0; i < edges.size(); ++i) {
        auto& [u, v, w] = edges[i];
        cout << "{\"from\":"<<u<<",\"to\":"<<v<<",\"weight\":"<<w<<"}"
             << (i+1<edges.size()?"," : "");
    }
    cout << "]}" << endl;
}

Graph buildGraphFromArgs(int argc, char* argv[], int startIndex) {
    Graph graph;
    if ((argc - startIndex) % 3 != 0) {
        cerr << "{\"type\":\"error\",\"message\":\"Invalid args: need u v w triplets\"}"<<endl;
        exit(1);
    }
    for (int i = startIndex; i+2<argc; i+=3) {
        int u=stoi(argv[i]), v=stoi(argv[i+1]), w=stoi(argv[i+2]);
        graph[u].push_back({v,w});
        graph[v].push_back({u,w});
    }
    return graph;
}

Graph buildDefaultGraph() {
    Graph g;
    g[0] = {{1,4},{2,1}};
    g[1] = {{0,4},{2,2},{3,5}};
    g[2] = {{0,1},{1,2},{3,8}};
    g[3] = {{1,5},{2,8}};
    return g;
}

void runDijkstra(const Graph& graph, int start=0, int end=3) {
    printInit(graph);
    unordered_map<int,int> dist, prev;
    unordered_set<int> vis;
    for (auto& [n,_]: graph) dist[n] = numeric_limits<int>::max();
    dist[start] = 0;
    priority_queue<pair<int,int>,vector<pair<int,int>>,greater<>> pq;
    pq.push({0,start});

    while (!pq.empty()) {
        auto [d,u] = pq.top(); pq.pop();
        printStep("choose", u, d,
                  "Choosing node "+to_string(u)+" with dist="+to_string(d));           // ⏱️

        if (d>dist[u]) {
            printStep("skip",u,d,"Skipping stale entry for node "+to_string(u));    // ⏱️
            continue;
        }
        if (vis.count(u)) {
            printStep("skip",u,d,"Skipping already visited node "+to_string(u));    // ⏱️
            continue;
        }
        vis.insert(u);
        printStep("visit",u,d,"Visiting node "+to_string(u));                     // ⏱️

        for (auto& e: graph.at(u)) {
            int v=e.to, w=e.weight;
            printStep("consider", u, v,
                      "Considering edge "+to_string(u)+"->"+to_string(v)+" (w="+to_string(w)+")"); // ⏱️
            if (dist[u]+w < dist[v]) {
                dist[v]=dist[u]+w;
                prev[v]=u;
                pq.push({dist[v],v});
                printStep("update",v,dist[v],
                          "Updated dist["+to_string(v)+"]="+to_string(dist[v]));     // ⏱️
            }
        }
    }

    vector<int> path;
    int cur=end;
    if (prev.find(cur)==prev.end() && cur!=start) {
        cout << "{\"step\":"<<STEP++<<",\"type\":\"final\",\"explanation\":\"No path to node "<<end<<"\"}"<<endl;
        return;
    }
    while(cur!=start){ path.push_back(cur); cur=prev[cur]; }
    path.push_back(start);
    reverse(path.begin(),path.end());
    printFinalPath(path, dist[end]);
}

void runPrims(const Graph& graph, int start=0) {
    printInit(graph);
    unordered_map<int,bool> inMST;
    unordered_map<int,int> key,parent;
    for (auto& [n,_]: graph) key[n]=numeric_limits<int>::max();
    key[start]=0;
    priority_queue<pair<int,int>,vector<pair<int,int>>,greater<>> pq;
    pq.push({0,start});
    vector<pair<int,int>> mst;
    int total=0;

    while(!pq.empty()) {
        auto [cost,u] = pq.top(); pq.pop();
        printStep("choose", u, cost,
                  "Choosing node "+to_string(u)+" with key="+to_string(cost));     // ⏱️

        if (inMST[u]) {
            printStep("skip",u,cost,"Skipping node already in MST "+to_string(u)); // ⏱️
            continue;
        }
        inMST[u]=true;
        total+=cost;
        if (u!=start) mst.emplace_back(parent[u],u);
        printStep("include",u,cost,
                  "Include node "+to_string(u)+" with connecting cost="+to_string(cost)); // ⏱️

        for (auto& e: graph.at(u)) {
            int v=e.to, w=e.weight;
            printStep("consider",u,v,
                      "Considering edge "+to_string(u)+"->"+to_string(v)+" (w="+to_string(w)+")"); // ⏱️
            if (!inMST[v] && w<key[v]) {
                key[v]=w;
                parent[v]=u;
                pq.push({w,v});
                printStep("update",v,w,
                          "Update key["+to_string(v)+"]="+to_string(w));              // ⏱️
            }
        }
    }

    printFinalMST(total, mst);
}

struct DSU {
    unordered_map<int,int> parent, rank;
    void makeSet(int x){ parent[x]=x; rank[x]=0; }
    int findSet(int x){
        if(parent[x]!=x) parent[x]=findSet(parent[x]);
        return parent[x];
    }
    bool unionSet(int a,int b){
        a=findSet(a); b=findSet(b);
        if(a==b) return false;
        if(rank[a]<rank[b]) swap(a,b);
        parent[b]=a;
        if(rank[a]==rank[b]) rank[a]++;
        return true;
    }
};

void runKruskal(const Graph& graph) {
    printInit(graph);
    vector<tuple<int,int,int>> edges;
    for (auto& [u,nbrs]: graph)
      for (auto& e: nbrs)
        if (u<e.to) edges.emplace_back(e.weight,u,e.to);

    sort(edges.begin(), edges.end(),
         [](auto &a, auto &b){ return get<0>(a) < get<0>(b); });

    DSU dsu;
    for (auto& [u,_]: graph) dsu.makeSet(u);

    vector<pair<int,int>> mst;
    int total=0;
    for (auto& [w,u,v]: edges) {
        printStep("consider", u, v,
                  "Considering edge "+to_string(u)+"-"+to_string(v)
                  +" (w="+to_string(w)+")");                          // ⏱️
        if (!dsu.unionSet(u,v)) {
            printStep("skip",u,v,
                      "Skipping edge "+to_string(u)+"-"+to_string(v)
                      +" (would form cycle)");                         // ⏱️
            continue;
        }
        total+=w;
        mst.emplace_back(u,v);
        printStep("include",u,w,
                  "Kruskal: include edge "+to_string(u)+"-"+to_string(v)
                  +" (w="+to_string(w)+")");                           // ⏱️
    }

    printFinalMST(total, mst);
}

void printEnd() {
    cout << "{\"step\":"<<STEP++<<",\"type\":\"end\"}" << endl;
}

int main(int argc, char* argv[]) {
    if(argc<2) {
        cerr << "{\"type\":\"error\",\"message\":\"Usage: <algo> [u v w ...]\"}"<<endl;
        return 1;
    }
    string algo=argv[1];
    Graph graph = (argc==2||(argc==3&&string(argv[2])=="0"))
                  ? buildDefaultGraph()
                  : buildGraphFromArgs(argc,argv,2);

    if(algo=="dijkstra")     runDijkstra(graph,0,3);
    else if(algo=="prims")   runPrims(graph);
    else if(algo=="kruskal") runKruskal(graph);
    else {
        cerr << "{\"type\":\"error\",\"message\":\"Unknown algorithm: "<<algo<<"\"}"<<endl;
        return 1;
    }

    printEnd();
    return 0;
}
