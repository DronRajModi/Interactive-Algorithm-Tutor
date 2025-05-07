import React, { useState, useEffect, useRef } from 'react';
import Graph from './Graphs/Graph';       
import Control from './Graphs/Control';   

const WIDTH = 600, HEIGHT = 400;

export default function HamiltonVisualizer() {
  const [nodes, setNodes] = useState([]);            // [0,1,2,3,…]
  const [edges, setEdges] = useState([]);            // [{from,to,weight}]
  const [steps, setSteps] = useState([]);            // SSE messages
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [userInput, setUserInput] = useState('');
  const [nodePositions, setNodePositions] = useState({});
  const intervalRef = useRef(null);
  const eventRef = useRef(null);

  // Compute node positions in a circle
  const calcPositions = ns => {
    const pos = {};
    const cx = WIDTH/2, cy = HEIGHT/2, r = Math.min(WIDTH,HEIGHT)*0.35;
    ns.forEach((n,i) => {
      const a = (i/ns.length)*Math.PI*2;
      pos[n] = { x: cx + r*Math.cos(a), y: cy + r*Math.sin(a) };
    });
    return pos;
  };

  // Play head-animation
  useEffect(() => {
    if (isPlaying && currentStep < steps.length-1) {
      intervalRef.current = setInterval(() => {
        setCurrentStep(s => {
          if (s < steps.length-1) return s+1;
          clearInterval(intervalRef.current);
          setIsPlaying(false);
          return s;
        });
      }, speed);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, currentStep, steps, speed]);

  const handleStart = () => {
    if (eventRef.current) { eventRef.current.close(); eventRef.current = null; }
    clearInterval(intervalRef.current);
    setSteps([]); setCurrentStep(0);
    setIsPlaying(false); setIsRunning(true);
  
    const flatInput = userInput.trim().split(/\s+/).map(n => parseInt(n)).filter(n => !isNaN(n));
  
    const N = Math.sqrt(flatInput.length);
    if (flatInput.length > 0 && !Number.isInteger(N)) {
      alert('Invalid input: Must be a flattened N x N adjacency matrix (e.g., 16 values for 4x4)');
      setIsRunning(false);
      return;
    }
  
    const body = flatInput.length > 0 ? { array: flatInput } : {};
  
    fetch('http://localhost:5000/run-hamiltonian_cycle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
      .then(r => {
        if (!r.ok) throw new Error();
        const es = new EventSource('http://localhost:5000/stream');
        eventRef.current = es;
  
        es.onmessage = e => {
          const d = JSON.parse(e.data);
          if (d.type !== 'Hamiltonian Cycle') return;
  
          if (steps.length === 0) {
            const N = d.graph.length;
            const ns = Array.from({ length: N }, (_, i) => i);
            setNodes(ns);
            const esList = [];
            for (let i = 0; i < N; i++) {
              for (let j = i + 1; j < N; j++) {
                if (d.graph[i][j] === 1) esList.push({ from: i, to: j, weight: 1 });
              }
            }
            setEdges(esList);
            setNodePositions(calcPositions(ns));
          }
  
          setSteps(prev => {
            if (prev.length === 0) {
              setIsPlaying(true);
              setCurrentStep(0);
            }
            return [...prev, d];
          });
        };
  
        es.onerror = () => { es.close(); setIsRunning(false); };
      })
      .catch(_ => {
        alert('Error starting Hamiltonian Cycle');
        setIsRunning(false);
      });
  };
  
  const handlePause = () => { setIsPlaying(false); clearInterval(intervalRef.current); };
  const handleReset = () => { handlePause(); setCurrentStep(0); setSteps([]); };
  const handleLast = () => { handlePause(); if(steps.length) setCurrentStep(steps.length-1); };

  // Highlighting functions
  const step = steps[currentStep]||{};
  const isEdgeHighlighted = (f,t) => {
    // in `step.path` array, highlight edges up to `step.vertex` index
    const p = step.path||[];
    const idx = p.indexOf(step.vertex);
    if (idx>0) {
      const u = p[idx-1], v = p[idx];
      return (f===u&&t===v)||(f===v&&t===u);
    }
    return false;
  };
  const isNodeActive = n => n===step.vertex;
  const isNodeInFinalSolution = n => (step.message||'').includes('') && (step.path||[]).includes(n);

  return (
    <div className="p-5 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Hamiltonian Cycle Visualizer</h1>

      <Control
             userInput={userInput}
        setUserInput={setUserInput}
        onStart={handleStart}
        onPause={handlePause}
        onReset={handleReset}
        onLast={handleLast}
        isRunning={isRunning}
        isPlaying={isPlaying}
        stepsLength={steps.length}
        currentStep={currentStep}
        speed={speed}
        setSpeed={setSpeed}
        placeholder="e.g., 0 1 0 1  1 0 1 1  0 1 0 1  1 1 1 0 (flattened 4x4 matrix)"
      />

      <div className="bg-white rounded-lg shadow p-4 mb-4 flex justify-center">
        <Graph
          width={WIDTH} height={HEIGHT}
          nodes={nodes} edges={edges}
          nodePositions={nodePositions}
          isEdgeHighlighted={isEdgeHighlighted}
          isNodeActive={isNodeActive}
          isNodeInFinalSolution={isNodeInFinalSolution}
        />
      </div>

      {steps.length > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded mb-4">
          <strong>Step {currentStep+1}/{steps.length}:</strong> {step.message}
        </div>
      )}
    </div>
  );
}
