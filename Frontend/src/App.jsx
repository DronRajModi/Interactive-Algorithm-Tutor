import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useParams
} from 'react-router-dom';

import Sidebar from './components/Sidebar';
import Visualizer from './components/Visualizer';
import BacktrackingVisualizer from './components/BacktrackingVisualizer';
import GreedyVisualizer from './components/GreedyVisualizer';
import DPVisualizer from './components/DPVisualizer';
import StringAlgoVisualizer from './components/StringAlgoVisualizer';
import HamiltonVisualizer from './components/HamiltonVisualizer';

function VisualizerRouter() {
  const { algorithm } = useParams();


  if (algorithm === 'nqueen') {
    return <BacktrackingVisualizer algorithm={algorithm} />;
  }
  if (algorithm === 'hamiltonian_cycle') {
    return <HamiltonVisualizer algorithm={algorithm} />;
  }
  if (['dijkstra', 'prims', 'kruskal'].includes(algorithm)) {
    return <GreedyVisualizer algorithm={algorithm} />;
  }
  if (['dp-knapsack', 'dp-fibonacci'].includes(algorithm)) {
    return <DPVisualizer algorithm={algorithm} />;
  }
  if (['string-kmp', 'string-rabin'].includes(algorithm)) {
    return <StringAlgoVisualizer algorithm={algorithm} />;
  }


  return <Visualizer selectedAlgorithm={algorithm} />;
}

export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-white">
        <Sidebar />

        <div className="flex-1 p-4">
          <Routes>
            <Route path="/" element={<Navigate to="/visualizer/bubble-sort" />} />
            <Route path="/visualizer/:algorithm" element={<VisualizerRouter />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
