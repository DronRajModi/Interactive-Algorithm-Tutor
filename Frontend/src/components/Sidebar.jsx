import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function Sidebar() {
  const [openCategory, setOpenCategory] = useState(null);
  const navigate = useNavigate();
  const { algorithm: selectedAlgorithm } = useParams() || {};

  const categories = {
    "Sorting Algorithm": [
      { name: "Merge Sort", value: "merge-sort" },
      { name: "Quick Sort", value: "quick-sort" },
      { name: "Counting Sort", value: "counting-sort" },
      { name: "Radix Sort", value: "radix-sort" },
      { name: "Bubble Sort", value: "bubble-sort" },
      { name: "Selection Sort", value: "selection-sort" },
      { name: "Insertion Sort", value: "insertion-sort" },
    ],
    "Dynamic Programming": [
      { name: "Knapsack", value: "dp-knapsack" },
      { name: "Fibonacci", value: "dp-fibonacci" },
    ],
    "Backtracking": [
      { name: "N-Queen", value: "nqueen" },
      { name: "Hamiltonian Cycle", value: "hamiltonian_cycle" },
    ],
    "Greedy": [
      { name: "Dijkstra's Algorithm", value: "dijkstra" },
      { name: "Prim's Algorithm", value: "prims" },
      { name: "Kruskal's Algorithm", value: "kruskal" },
    ],
    "String Algorithms": [
      { name: "KMP", value: "string-kmp" },
      { name: "Rabin-Karp", value: "string-rabin" },
    ],
  };

  const toggleCategory = (cat) =>
    setOpenCategory(openCategory === cat ? null : cat);

  return (
    <div className="w-64 bg-gray-800 text-white min-h-screen p-4 space-y-4">
      {Object.entries(categories).map(([category, algos]) => (
        <div key={category}>
          <button
            onClick={() => toggleCategory(category)}
            className="w-full text-left font-bold py-2 px-2 hover:bg-gray-700 rounded"
          >
            {category}
          </button>

          {openCategory === category && (
            <div className="pl-4 space-y-2">
              {algos.map(({ name, value }) => (
                <button
                  key={value}
                  onClick={() => navigate(`/visualizer/${value}`)}
                  className={`block w-full text-left py-1 px-2 rounded text-sm ${
                    selectedAlgorithm === value
                      ? 'bg-blue-600'
                      : 'hover:bg-gray-600'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
