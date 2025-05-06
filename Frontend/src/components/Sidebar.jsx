import { useState } from 'react';

export default function Sidebar({ onAlgorithmSelect, selectedAlgorithm }) {
  const [openCategory, setOpenCategory] = useState(null);

  const categories = {
    "Divide and Conquer": [
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
    ],
    "Greedy": [
      { name: "Dijkstra's Algorithm", value: "dijkstra" },
      { name: "Prim's Algorithm", value: "prims" },
      { name: "Hamiltonian Cycle", value: "hamiltonian_cycle" },
      {name: "Kruskal's Algorithm", value: "kruskal" },
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
      {Object.keys(categories).map((category) => (
        <div key={category}>
          <button
            onClick={() => toggleCategory(category)}
            className="w-full text-left font-bold py-2 px-2 hover:bg-gray-700 rounded"
          >
            {category}
          </button>
          {openCategory === category && (
            <div className="pl-4 space-y-2">
              {categories[category].map((algo) => (
                <button
                  key={algo.value}
                  onClick={() => onAlgorithmSelect(algo.value)}
                  className={`block w-full text-left py-1 px-2 rounded text-sm ${
                    selectedAlgorithm === algo.value
                      ? 'bg-blue-600'
                      : 'hover:bg-gray-600'
                  }`}
                >
                  {algo.name}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
