import { useState } from 'react';
import Visualizer from './components/Visualizer';
import Sidebar from './components/Sidebar';
import BacktrackingVisualizer from './components/BacktrackingVisualizer'; // import the new component

export default function App() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('');

  const isBacktracking = selectedAlgorithm === 'nqueen'; // extend this if you add more backtracking algos

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar onAlgorithmSelect={setSelectedAlgorithm} />
      <div className="flex-1 p-4">
        {isBacktracking ? (
          <BacktrackingVisualizer selectedAlgorithm={selectedAlgorithm} />
        ) : (
          <Visualizer selectedAlgorithm={selectedAlgorithm} />
        )}
      </div>
    </div>
  );
}
