import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WIDTH = 600;
const HEIGHT = 400;

const defaultGraph = {
  nodes: [0, 1, 2, 3, 4],
  edges: [
    { from: 0, to: 1, weight: 4 },
    { from: 0, to: 2, weight: 1 },
    { from: 2, to: 1, weight: 2 },
    { from: 1, to: 3, weight: 1 },
    { from: 2, to: 3, weight: 5 },
    { from: 3, to: 4, weight: 3 },
  ]
};

const positions = [
  { x: 300, y: 50 },
  { x: 100, y: 150 },
  { x: 500, y: 150 },
  { x: 200, y: 300 },
  { x: 400, y: 300 },
];

export default function GreedyGraphVisualizer() {
  const [graph, setGraph] = useState(defaultGraph);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [finalPath, setFinalPath] = useState([]);
  const intervalRef = useRef(null);
  const [userInput, setUserInput] = useState("");

  const fetchSteps = async () => {
    setSteps([]);
    setFinalPath([]);
  
    const parsedInput = userInput
      .split(/\s+/)
      .map(Number)
      .filter(n => !isNaN(n));
  
    // Send input to backend
    await fetch('http://localhost:5000/run-greedy-dijkstra', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ array: parsedInput.length ? parsedInput : undefined })
    });
  
    const eventSource = new EventSource('http://localhost:5000/stream');
  
    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data);
  
      // Assuming backend emits step like: { node: 0, visited: true, distance: 0 }
      if (data.type === 'step') {
        setSteps(prev => [...prev, data.payload]);
      } else if (data.type === 'final') {
        setFinalPath(data.payload);  // [0,2,1,3,4]
      }
    };
  
    eventSource.addEventListener('end', () => {
      setIsPlaying(false);
      eventSource.close();
    });
  };
  

  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      intervalRef.current = setInterval(() => {
        setCurrentStep(prev => prev + 1);
      }, speed);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, currentStep, steps, speed]);

  const handleStart = () => {
    fetchSteps();
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleLast = () => {
    setIsPlaying(false);
    setCurrentStep(steps.length - 1);
  };

  return (
    <div style={{ background: "#fff", color: "#000", padding: 20, minHeight: "100vh" }}>
      <input
        type="text"
        placeholder="Enter edges (e.g. 0 1 4 1 2 3)"
        value={userInput}
        onChange={e => setUserInput(e.target.value)}
        style={{ border: '1px solid #ccc', padding: '5px', width: '100%' }}
      />
      <div className="flex items-center gap-4 mt-2">
        <button onClick={handleStart} style={{ backgroundColor: 'green', color: 'white', padding: '6px 12px' }}>Start</button>
        <button onClick={handlePause} style={{ backgroundColor: 'orange', color: 'white', padding: '6px 12px' }}>Pause</button>
        <button onClick={handleLast} style={{ backgroundColor: 'blue', color: 'white', padding: '6px 12px' }}>Last</button>
        <input
          type="range"
          min={200}
          max={2000}
          step={100}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
        />
      </div>

      {/* SVG Graph */}
      <svg width={WIDTH} height={HEIGHT} style={{ background: "#f9f9f9", marginTop: 20, borderRadius: 8 }}>
        {graph.edges.map((edge, i) => {
          const from = positions[edge.from];
          const to = positions[edge.to];
          const isHighlighted = finalPath.includes(edge.from) && finalPath.includes(edge.to);
          return (
            <line
              key={i}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={isHighlighted ? 'green' : '#aaa'}
              strokeWidth={isHighlighted ? 3 : 1.5}
            />
          );
        })}
        {graph.edges.map((edge, i) => {
          const from = positions[edge.from];
          const to = positions[edge.to];
          const midX = (from.x + to.x) / 2;
          const midY = (from.y + to.y) / 2;
          return (
            <text key={`weight-${i}`} x={midX} y={midY - 5} fontSize="12" fill="#000">
              {edge.weight}
            </text>
          );
        })}
        <AnimatePresence>
          {graph.nodes.map((node, i) => {
            const pos = positions[i];
            const step = steps[currentStep] || {};
            const isActive = step.node === i;
            return (
              <motion.circle
                key={i}
                cx={pos.x}
                cy={pos.y}
                r={20}
                fill={isActive ? '#ff0' : '#fff'}
                stroke="#000"
                strokeWidth={2}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
              />
            );
          })}
        </AnimatePresence>
        {graph.nodes.map((node, i) => {
          const pos = positions[i];
          return (
            <text key={`label-${i}`} x={pos.x} y={pos.y + 5} textAnchor="middle" fontWeight="bold" fill="#000">
              {node}
            </text>
          );
        })}
      </svg>

      {/* Final Solved Path */}
      <div className="mt-4 p-3 border border-green-600 rounded bg-green-50">
        <h3 className="font-bold text-green-800">Final Solved Graph</h3>
        {finalPath.map((n, i) => (
          <div key={i}>Step {i + 1}: Node {n}</div>
        ))}
      </div>

      {/* Step History */}
      <div className="mt-4 p-3 border border-gray-400 rounded h-40 overflow-y-auto bg-gray-100">
        {steps.slice(0, currentStep + 1).map((step, i) => (
          <div key={i}>
            Node {step.node} visited with distance {step.distance}
          </div>
        ))}
      </div>
    </div>
  );
}
