import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Visualizer from './components/Visualizer';
import BacktrackingVisualizer from './components/BacktrackingVisualizer';
import GreedyVisualizer from './components/GreedyVisualizer';
import DPVisualizer from './components/DPVisualizer';
import StringAlgoVisualizer from './components/StringAlgoVisualizer';

export default function App() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('');

  const isBacktracking = selectedAlgorithm === 'nqueen';
  const isGreedy = ['dijkstra', 'prim', 'hamiltonian_cycle'].includes(selectedAlgorithm);
  const isDP = ['dp-knapsack', 'dp-fibonacci'].includes(selectedAlgorithm);
  const isStringAlgo = ['string-kmp', 'string-rabin'].includes(selectedAlgorithm);

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar
        selectedAlgorithm={selectedAlgorithm}
        onAlgorithmSelect={setSelectedAlgorithm}
      />
      <div className="flex-1 p-4">
        {isBacktracking ? (
          <BacktrackingVisualizer algorithm={selectedAlgorithm} />
        ) : isGreedy ? (
          <GreedyVisualizer algorithm={selectedAlgorithm} />
        ) : isDP ? (
          <DPVisualizer algorithm={selectedAlgorithm} />
        ) : isStringAlgo ? (
          <StringAlgoVisualizer algorithm={selectedAlgorithm} />
        ) : (
          <Visualizer selectedAlgorithm={selectedAlgorithm} />
        )}
      </div>
    </div>
  );
}
