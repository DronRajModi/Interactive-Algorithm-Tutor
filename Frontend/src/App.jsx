// frontend/src/App.jsx

import Visualizer from './components/Visualizer';

export default function App() {
  return (
    <div className="min-h-screen bg-white text-center py-10">
      <h1 className="text-2xl font-bold mb-4">Merge Sort Visualizer (C++)</h1>
      <Visualizer />
    </div>
  );
}
