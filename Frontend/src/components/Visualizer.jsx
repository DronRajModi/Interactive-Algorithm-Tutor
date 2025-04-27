import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function Visualizer({ selectedAlgorithm }) {
  const [history, setHistory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(300);
  const esRef = useRef(null);

  const colors = [
    "bg-red-400", "bg-blue-400", "bg-green-400", 
    "bg-yellow-400", "bg-purple-400", "bg-pink-400", "bg-orange-400",
    "bg-teal-400", "bg-indigo-400"
  ];

  useEffect(() => {
    if (selectedAlgorithm) {
      startSort(selectedAlgorithm);
    }
    return () => {
      if (esRef.current) esRef.current.close();
    };
  }, [selectedAlgorithm]);

  const handleStep = async (step) => {
    if (step.message) {
      setLogs(prev => [...prev, step.message]);
    }
  
    if (step.type === 'start') {
      setHistory([[step.array]]);
      return;
    }
  
    if (step.type === 'split' || step.type === 'merge') {
      const splits = splitArray(step.array, step.l, step.r);
      setHistory(prev => [...prev, splits]);
    } 
    
    // NEW CODE for compare / swap
    else if (step.type === 'compare' || step.type === 'swap') {
      setHistory(prev => [...prev, [step.array]]);
    }
  
    else if (step.type === 'end') {
      setHistory(prev => [...prev, [step.array]]);
      setRunning(false);
      return;
    }
  
    await new Promise(res => setTimeout(res, speed));
  };
  

  const splitArray = (arr, l, r) => {
    if (l === undefined || r === undefined || l < 0 || r < 0) {
      return [arr];
    }
    const left = arr.slice(0, l);
    const middle = arr.slice(l, r + 1);
    const right = arr.slice(r + 1);
    const groups = [];
    if (left.length) groups.push(left);
    if (middle.length) groups.push(middle);
    if (right.length) groups.push(right);
    return groups;
  };

  const startSort = (algorithm) => {
    setRunning(true);
    setLogs([]);
    setHistory([]);

    const es = new EventSource(`http://localhost:5000/run-${algorithm}`);
    esRef.current = es;

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

  return (
    <div className="p-4 w-full space-y-6">

      {/* Title */}
      <h1 className="text-2xl font-bold text-center">
        {selectedAlgorithm ? selectedAlgorithm.replace('-', ' ').toUpperCase() : "Select an Algorithm"}
      </h1>

      {/* Speed Control */}
      <div className="flex items-center gap-4 justify-center">
        <label className="font-semibold">Speed:</label>
        <input
          type="range"
          min="50"
          max="1000"
          step="50"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="w-64"
        />
        <span className="font-mono">{speed}ms</span>
      </div>

      {/* History Visualizer */}
      <div className="bg-gray-100 p-6 rounded-2xl shadow-inner min-h-[400px] flex flex-col gap-6 items-center">
        {history.map((step, stepIdx) => (
          <div key={stepIdx} className="flex flex-wrap justify-center gap-4">
            {step.map((group, groupIdx) => (
              <div 
                key={groupIdx} 
                className="flex gap-2 p-2 rounded-xl border-gray-300 border-2"
              >
                {group.map((value, idx) => (
                  <motion.div
                    key={idx}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="w-10 h-10 flex items-center justify-center bg-white rounded-md text-gray-800 font-bold text-sm shadow"
                  >
                    {value}
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Logs */}
      <div className="bg-white p-4 rounded-lg shadow max-h-48 overflow-y-auto text-left">
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
