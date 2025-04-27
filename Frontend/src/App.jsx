import { useState } from 'react';
import Visualizer from './components/Visualizer';
import Sidebar from './components/Sidebar';

export default function App() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('');

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar onAlgorithmSelect={setSelectedAlgorithm} />
      <div className="flex-1 p-4">
        <Visualizer selectedAlgorithm={selectedAlgorithm} />
      </div>
    </div>
  );
}
