#include <iostream>
#include <vector>
#include <string>
#include <sstream>
using namespace std;
int N;
void emitStep(const vector<string>& board, const string& message, int row, int col, bool placing) {
    stringstream ss;
    ss << R"({"board":[)";
    for (int i = 0; i < board.size(); ++i) {
        ss << "\"" << board[i] << "\"";
        if (i != board.size() - 1) ss << ",";
    }
    ss << R"(],"message":")" << message << R"(","row":)" << row << R"(,"col":)" << col << R"(,"placing":)" << (placing ? "true" : "false") << "}";
    cout << ss.str() << endl;
    cout.flush();
}
bool isSafe(const vector<string>& board, int row, int col) {
    for (int i = 0; i < row; ++i)
        if (board[i][col] == 'Q') return false;
    for (int i = row - 1, j = col - 1; i >= 0 && j >= 0; --i, --j)
        if (board[i][j] == 'Q') return false;
    for (int i = row - 1, j = col + 1; i >= 0 && j < N; --i, ++j)
        if (board[i][j] == 'Q') return false;
    return true;
}
bool solutionFound = false;

bool solve(vector<string>& board, int row) {
    if (row == N) {
        emitStep(board, " Solution found!", -1, -1, false);
        return true; // stop recursion here
    }

    for (int col = 0; col < N; ++col) {
        emitStep(board, "Trying queen at (" + to_string(row) + "," + to_string(col) + ")", row, col, true);
        if (isSafe(board, row, col)) {
            board[row][col] = 'Q';
            emitStep(board, "Placed queen at (" + to_string(row) + "," + to_string(col) + ")", row, col, true);
            if (solve(board, row + 1)) return true; 
            board[row][col] = '.';
            emitStep(board, "Backtracking from (" + to_string(row) + "," + to_string(col) + ")", row, col, false);
        } else {
            emitStep(board, "Position (" + to_string(row) + "," + to_string(col) + ") is not safe", row, col, false);
        }
    }

    return false; // no solution in this path
}

int main(int argc, char* argv[]) {
    if (argc > 1) {
        N = stoi(argv[1]);
    } else {
        cin >> N;
    }

    if (N < 1) {
        cout << R"({"error":"Invalid N"})" << endl;
        return 1;
    }

    vector<string> board(N, string(N, '.'));
    solve(board, 0);

    cout << R"({"action":"final"})" << endl;
    cout.flush();
    return 0;
}
