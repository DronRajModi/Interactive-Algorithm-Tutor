import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Visualizer() {
  const [array, setArray] = useState([]);
  const [segments, setSegments] = useState(null);
  const [highlighted, setHighlighted] = useState([]);
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(false);
  const [sortingAlgorithm, setSortingAlgorithm] = useState('');
  const [currentStep, setCurrentStep] = useState('');

  const handleStep = async (step) => {
    // Log message
    if (step.message) {
      setLogs(prev => [...prev, step.message]);
      setCurrentStep(step.message);
    }

    // Update array state
    if (step.type === 'start') {
      setArray(step.array);
      setSegments(null);
      setHighlighted([]);
      return;
    }
    if (step.type === 'end') {
      setArray(step.array);
      setSegments(null);
      setHighlighted([]);
      setCurrentStep('✔ Sorting Complete');
      setRunning(false);
      return;
    }

    setArray(step.array);

    // Handle segment highlights for merge/split
    if (step.type === 'merge' || step.type === 'split') {
      setSegments(step);
      setHighlighted([]);
    }
    // Highlight comparisons
    else if (step.type === 'compare') {
      setHighlighted([step.l, step.r].filter(idx => idx >= 0));
      setSegments(null);
    }
    // Default: clear highlights/segments
    else {
      setHighlighted([]);
      setSegments(null);
    }

    // Pause between steps for visibility
    await new Promise(res => setTimeout(res, 300));
  };

  const startSort = (algorithm) => {
    setRunning(true);
    setSortingAlgorithm(algorithm);
    setLogs([]);
    setArray([]);
    setHighlighted([]);
    setSegments(null);
    setCurrentStep('');

    const es = new EventSource(`http://localhost:5000/run-${algorithm}`);
    es.onmessage = async (e) => {
      const text = e.data.trim();
      if (!text.startsWith('{')) return;
      try {
        const step = JSON.parse(text);
        await handleStep(step);
      } catch {
        setLogs(prev => [...prev, text]);
      }
    };
    es.addEventListener('end', () => es.close());
  };

  const getSegmentValues = () =>
    segments ? array.slice(segments.l, segments.r + 1) : [];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Header with algorithm buttons */}
      <div className="flex flex-wrap justify-between items-center space-y-2">
        <h1 className="text-3xl font-bold">Sorting Visualizer ({sortingAlgorithm})</h1>
        <div className="flex flex-wrap gap-2">
          {['merge-sort','quick-sort','bubble-sort','selection-sort','insertion-sort','heap-sort','counting-sort','radix-sort','bucket-sort'].map(algo => (
            <button
              key={algo}
              onClick={() => startSort(algo)}
              disabled={running}
              className="bg-indigo-600 text-white px-4 py-2 rounded shadow disabled:opacity-50"
            >
              {running && sortingAlgorithm === algo
                ? `Running ${algo.replace('-', ' ')}…`
                : `Run ${algo.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}`}
            </button>
          ))}
        </div>
      </div>

      {/* Segment animation area */}
      <div className="bg-yellow-50 p-4 rounded-xl shadow min-h-[60px] transition-all">
        <AnimatePresence mode="wait">
          {segments && (
            <motion.div
              key={`${segments.l}-${segments.r}-${segments.type}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex space-x-2 justify-center items-center"
            >
              {getSegmentValues().map((v, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="px-3 py-1 bg-yellow-100 text-yellow-900 rounded-md font-semibold"
                >
                  {v}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bar chart visualization */}
      <div className="bg-gray-100 p-6 rounded-2xl shadow-inner h-64 flex items-end gap-2">
        {array.map((v, i) => {
          const isHigh = highlighted.includes(i);
          return (
            <motion.div
              key={i}
              layout
              initial={{ height: 0 }}
              animate={{ height: `${v * 3}px` }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
              className={`flex-1 rounded relative ${isHigh ? 'bg-red-500' : 'bg-green-500'}`}
            >
              <span className="absolute -top-5 w-full text-center text-black text-xs font-bold">
                {v}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Logs panel */}
      <div className="bg-white p-4 rounded-lg shadow max-h-48 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-2">Logs</h2>
        <ul className="font-mono text-sm space-y-1">
          {logs.map((msg, idx) => (
            <li key={idx}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}