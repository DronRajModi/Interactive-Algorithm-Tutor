import React, { useState, useEffect, useRef } from 'react';
import Graph from './Graphs/Graph';
import Control from './Graphs/Control';

const WIDTH = 600;
const HEIGHT = 400;

export default function HamiltonVisualizer() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [userInput, setUserInput] = useState('');
  const [nodePositions, setNodePositions] = useState({});
  const intervalRef = useRef(null);
  const eventRef = useRef(null);

  
  const calcPositions = ns => {
    const pos = {};
    const cx = WIDTH / 2, cy = HEIGHT / 2, r = Math.min(WIDTH, HEIGHT) * 0.35;
    ns.forEach((n, i) => {
      const angle = (i / ns.length) * Math.PI * 2;
      pos[n] = { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
    });
    return pos;
  };

 
  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      intervalRef.current = setInterval(() => {
        setCurrentStep(s => {
          if (s < steps.length - 1) return s + 1;
          clearInterval(intervalRef.current);
          setIsPlaying(false);
          return s;
        });
      }, speed);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, currentStep, steps, speed]);

  const handleStart = () => {
   
    if (eventRef.current) {
      eventRef.current.close();
      eventRef.current = null;
    }
    clearInterval(intervalRef.current);
    setSteps([]);
    setCurrentStep(0);
    setIsPlaying(false);
    setIsRunning(true);

    // parse all ints
    const flatInput = userInput
      .trim()
      .split(/\s+/)
      .map(tok => parseInt(tok, 10))
      .filter(n => !isNaN(n));

    // if anything was entered, it must be a perfect square
    if (flatInput.length > 0) {
      const N = Math.sqrt(flatInput.length);
      if (!Number.isInteger(N)) {
        alert(
          'Invalid input: must be a flattened N×N adjacency matrix\n' +
          `(entered ${flatInput.length} numbers; e.g. 16 for 4×4)`
        );
        setIsRunning(false);
        return;
      }
    }

    // only include the array field if the user actually typed numbers
    const body = flatInput.length > 0
      ? { array: flatInput }
      : {};

    fetch('http://localhost:5000/run-hamiltonian_cycle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(r => {
        if (!r.ok) throw new Error('Network response not OK');
        const es = new EventSource('http://localhost:5000/stream');
        eventRef.current = es;

        es.onmessage = e => {
          const d = JSON.parse(e.data);
          if (d.type !== 'Hamiltonian Cycle') return;

          // first message: build nodes & edges
          if (steps.length === 0) {
            const size = d.graph.length;
            const ns = Array.from({ length: size }, (_, i) => i);
            setNodes(ns);

            const esList = [];
            for (let i = 0; i < size; i++) {
              for (let j = i + 1; j < size; j++) {
                if (d.graph[i][j] === 1) {
                  esList.push({ from: i, to: j, weight: 1 });
                }
              }
            }
            setEdges(esList);
            setNodePositions(calcPositions(ns));
          }

          setSteps(prev => {
            // kick off the playback on the very first step
            if (prev.length === 0) {
              setIsPlaying(true);
              setCurrentStep(0);
            }
            return [...prev, d];
          });
        };

        es.onerror = () => {
          es.close();
          setIsRunning(false);
        };
      })
      .catch(() => {
        alert('Error starting Hamiltonian Cycle');
        setIsRunning(false);
      });
  };

  const handlePause = () => {
    setIsPlaying(false);
    clearInterval(intervalRef.current);
  };
  const handleReset = () => {
    handlePause();
    setCurrentStep(0);
    setSteps([]);
  };
  const handleLast = () => {
    handlePause();
    if (steps.length) setCurrentStep(steps.length - 1);
  };

  // helpers for highlighting
  const step = steps[currentStep] || {};
  const isEdgeHighlighted = (u, v) => {
    const p = step.path || [];
    const idx = p.indexOf(step.vertex);
    if (idx > 0) {
      const a = p[idx - 1], b = p[idx];
      return (u === a && v === b) || (u === b && v === a);
    }
    return false;
  };
  const isNodeActive = n => n === step.vertex;
  const isNodeInFinalSolution = n =>
    step.message?.includes('✅') && (step.path || []).includes(n);

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
        placeholder={
          "Paste a flattened N×N matrix (e.g. 25 nums for 5×5):\n" +
          "0 1 1 0 1  1 0 1 1 0  1 1 0 1 1  0 1 1 0 1  1 0 1 1 0"
        }
      />

      <div className="bg-white rounded-lg shadow p-4 mb-4 flex justify-center">
        <Graph
          width={WIDTH}
          height={HEIGHT}
          nodes={nodes}
          edges={edges}
          nodePositions={nodePositions}
          isEdgeHighlighted={isEdgeHighlighted}
          isNodeActive={isNodeActive}
          isNodeInFinalSolution={isNodeInFinalSolution}
        />
      </div>

      {steps.length > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded mb-4">
          <strong>
            Step {currentStep + 1}/{steps.length}:
          </strong>{' '}
          {step.message}
        </div>
      )}
    </div>
  );
}
