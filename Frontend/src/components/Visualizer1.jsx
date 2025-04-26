import { useState } from 'react';

function SegmentBox({ title, items }) {
  return (
    <div className="flex-1 bg-white shadow p-4 rounded">
      <h3 className="text-gray-700 font-medium mb-2">{title}</h3>
      <div className="flex space-x-2">
        {items.map((v, i) => (
          <div key={i} className="px-2 py-1 bg-blue-100 text-blue-800 font-bold rounded">
            {v}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Visualizer() {
  const [array, setArray] = useState([]);
  const [segments, setSegments] = useState(null);
  const [highlighted, setHighlighted] = useState([]);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState([]);

  const handleStep = (step) => {
    if (step.type === 'end') {
      setRunning(false);
      return;
    }

    setArray(step.array);
    setLogs(prev => [...prev, step]);

    if (step.type === 'split' || step.type === 'merge') {
      setSegments({ type: step.type, l: step.l, r: step.r });
      setHighlighted([]);
    } else if (step.type === 'compare') {
      setHighlighted([step.l]);
      setSegments(null);
    } else {
      setSegments(null);
      setHighlighted([]);
    }
  };

  const startSort = () => {
    setArray([]);
    setSegments(null);
    setHighlighted([]);
    setLogs([]);
    setRunning(true);

    const es = new EventSource('http://localhost:5000/run-merge-sort');
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        handleStep(data);
      } catch (err) {
        console.error('Invalid JSON', e.data);
      }
    };
    es.addEventListener('end', () => {
      es.close();
      setRunning(false);
    });
  };

  // Render split/merge segments
  const renderSegments = () => {
    if (!segments) return null;
    const { type, l, r } = segments;

    if (type === 'split') {
      const m = Math.floor((l + r) / 2);
      const left = array.slice(l, m + 1);
      const right = array.slice(m + 1, r + 1);
      return (
        <div className="flex space-x-4 mb-6">
          <SegmentBox title="Left Half" items={left} />
          <SegmentBox title="Right Half" items={right} />
        </div>
      );
    }

    if (type === 'merge') {
      const segItems = array.slice(l, r + 1);
      return (
        <div className="flex space-x-4 mb-6">
          <SegmentBox title="Merging Segment" items={segItems} />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Merge Sort Visualizer</h1>
      <button
        onClick={startSort}
        disabled={running}
        className="mb-6 bg-indigo-600 text-white px-5 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
      >
        {running ? 'Running...' : 'Run Merge Sort'}
      </button>

      {renderSegments()}

      <div className="flex items-end h-64 bg-gray-100 p-4 rounded-lg shadow-inner mb-6">
        {array.map((v, i) => (
          <div
            key={i}
            className={`relative w-6 mx-1 rounded-t-md transition-all duration-300 ${
              highlighted.includes(i) ? 'bg-red-500' : 'bg-green-500'
            }`}
            style={{ height: `${v * 3}px` }}
          >
            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-bold text-black">
              {v}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg max-h-48 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-3">Logs</h2>
        <ul className="font-mono text-sm space-y-1">
          {logs.map((step, idx) => (
            <li key={idx}>{JSON.stringify(step)}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
