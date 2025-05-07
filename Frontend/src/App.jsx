import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Visualizer from './components/Visualizer';
import BacktrackingVisualizer from './components/BacktrackingVisualizer';
import GreedyVisualizer from './components/GreedyVisualizer';
import DPVisualizer from './components/DPVisualizer';
import StringAlgoVisualizer from './components/StringAlgoVisualizer';
import HamiltonVisualizer from './components/HamiltonVisualizer';  // <— import it

export default function App() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('');

  const isNQueen      = selectedAlgorithm === 'nqueen';
  const isHamiltonian = selectedAlgorithm === 'hamiltonian_cycle';
  const isGreedy      = ['dijkstra','prims','kruskal'].includes(selectedAlgorithm);
  const isDP          = ['dp-knapsack','dp-fibonacci'].includes(selectedAlgorithm);
  const isStringAlgo  = ['string-kmp','string-rabin'].includes(selectedAlgorithm);

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar
        selectedAlgorithm={selectedAlgorithm}
        onAlgorithmSelect={setSelectedAlgorithm}
      />
      <div className="flex-1 p-4">
        {isNQueen ? (
          <BacktrackingVisualizer algorithm={selectedAlgorithm} />
        ) : isHamiltonian ? (
          <HamiltonVisualizer />
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
