import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const WIDTH = 600;
const HEIGHT = 400;

export default function GraphAlgorithmVisualizer() {
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [finalPath, setFinalPath] = useState([]); // for Dijkstra
  const [finalEdges, setFinalEdges] = useState([]); // for Prim
  const [totalCost, setTotalCost] = useState(0);
  const [algorithm, setAlgorithm] = useState('dijkstra');
  const [userInput, setUserInput] = useState('');
  const [nodePositions, setNodePositions] = useState({});
  const [explanation, setExplanation] = useState('');
  const intervalRef = useRef(null);

  // Calculate positions for nodes in a circular layout
  const calculateNodePositions = (nodes) => {
    const positions = {};
    const centerX = WIDTH / 2;
    const centerY = HEIGHT / 2;
    const radius = Math.min(WIDTH, HEIGHT) * 0.35;

    nodes.forEach((node, index) => {
      const angle = (index / nodes.length) * Math.PI * 2;
      positions[node] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });

    return positions;
  };

  // Auto-play animation effect
  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      intervalRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < steps.length - 1) {
            return prev + 1;
          } else {
            clearInterval(intervalRef.current);
            setIsPlaying(false);
            return prev;
          }
        });
      }, speed);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, currentStep, steps.length, speed]);

  // Handle Start: sends request to backend and begins playback
  const handleStart = () => {
    setIsPlaying(false); // Stop existing animation if any
    setCurrentStep(0);
    setSteps([]); // Clear previous steps
    setFinalPath([]);
    setFinalEdges([]);
    setTotalCost(0);
    setExplanation('');
    clearInterval(intervalRef.current);
    setIsRunning(true);

    const endpoint = `http://localhost:5000/run-greedy-${algorithm.toLowerCase()}`;

    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: userInput.trim() // May be empty; backend will handle default
      })
    }).then(response => {
      if (!response.ok) {
        throw new Error('Failed to start algorithm');
      }

      const eventSource = new EventSource('http://localhost:5000/stream');

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'init':
            // Use calculateNodePositions here with the nodes from backend
            const positions = calculateNodePositions(data.nodes);
            setNodePositions(positions);
            setGraph({
              nodes: data.nodes,
              edges: data.edges
            });
            break;

          case 'visit':
          case 'update':
          case 'include':
            setSteps(prevSteps => {
              const newSteps = [...prevSteps, data];
              // Start playing if this is the first step
              if (prevSteps.length === 0) {
                setIsPlaying(true);
                setCurrentStep(0);
              }
              return newSteps;
            });
            break;

          case 'final':
            if (data.path) {
              setFinalPath(data.path.split('->').map(Number));
              setTotalCost(data.cost);
              setExplanation(data.explanation);
            } else if (data.mst) {
              const edges = data.mst
                .match(/\((\d+)-(\d+)\)/g)
                .map(pair => {
                  const [_, from, to] = pair.match(/\((\d+)-(\d+)\)/);
                  return { from: parseInt(from), to: parseInt(to) };
                });
              setFinalEdges(edges);
              setTotalCost(data.cost);
              setExplanation(data.explanation);
            }
            break;

          case 'end':
            eventSource.close();
            setIsRunning(false);
            break;

          case 'error':
            alert(data.message || 'Error occurred.');
            eventSource.close();
            setIsRunning(false);
            break;

          default:
            console.warn('Unknown message type:', data);
        }
      };

      eventSource.onerror = (err) => {
        console.error('SSE error:', err);
        eventSource.close();
        setIsRunning(false);
      };
    }).catch(err => {
      alert('Error: ' + err.message);
      setIsRunning(false);
    });
  };

  const handlePause = () => {
    setIsPlaying(false);
    clearInterval(intervalRef.current);
  };

  const handleReset = () => {
    setIsPlaying(false);
    clearInterval(intervalRef.current);
    setCurrentStep(0);
  };

  const handleLast = () => {
    setIsPlaying(false);
    clearInterval(intervalRef.current);
    if (steps.length > 0) {
      setCurrentStep(steps.length - 1);
    }
  };

  const isEdgeHighlighted = (from, to) => {
    if (algorithm === 'dijkstra') {
      // For Dijkstra, highlight edges in the final path
      for (let i = 0; i < finalPath.length - 1; i++) {
        if (
          (finalPath[i] === from && finalPath[i + 1] === to) ||
          (finalPath[i] === to && finalPath[i + 1] === from)
        ) {
          return true;
        }
      }
    } else {
      // For Prim's, highlight edges in the MST
      return finalEdges.some(
        e => (e.from === from && e.to === to) || (e.from === to && e.to === from)
      );
    }
    return false;
  };

  const isNodeActive = (node) => {
    const currentStepInfo = steps[currentStep];
    return currentStepInfo && currentStepInfo.node === node;
  };

  const isNodeInFinalSolution = (node) => {
    return (
      (algorithm === 'dijkstra' && finalPath.includes(node)) ||
      (algorithm === 'prims' && finalEdges.some(e => e.from === node || e.to === node))
    );
  };

  return (
    <div className="p-5 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Graph Algorithm Visualizer</h1>
      
      <div className="mb-4">
        <div className="flex gap-4 mb-2">
          <div className="flex items-center">
            <input
              type="radio"
              id="dijkstra"
              name="algorithm"
              value="dijkstra"
              checked={algorithm === 'dijkstra'}
              onChange={() => setAlgorithm('dijkstra')}
              className="mr-2"
            />
            <label htmlFor="dijkstra">Dijkstra's Algorithm</label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="prims"
              name="algorithm"
              value="prims"
              checked={algorithm === 'prims'}
              onChange={() => setAlgorithm('prims')}
              className="mr-2"
            />
            <label htmlFor="prims">Prim's Algorithm</label>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Enter edge list as "from to weight" triplets (e.g., "0 1 4 0 2 1 1 2 2 1 3 5 2 3 8")
          </label>
          <input
            type="text"
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            placeholder="Leave empty for default graph from backend"
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <button 
          onClick={handleStart} 
          disabled={isRunning}
          className={`bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isRunning ? 'Running...' : 'Start'}
        </button>
        <button 
          onClick={handlePause} 
          disabled={!isPlaying}
          className={`bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition ${!isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Pause
        </button>
        <button 
          onClick={handleReset} 
          disabled={steps.length === 0}
          className={`bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition ${steps.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Reset
        </button>
        <button 
          onClick={handleLast} 
          disabled={steps.length === 0}
          className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition ${steps.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Last Step
        </button>
        <div className="flex items-center">
          <span className="mr-2 text-sm">Speed:</span>
          <input
            type="range"
            min={200}
            max={2000}
            step={100}
            value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
            className="w-32"
          />
          <span className="ml-2 text-sm">{speed}ms</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="bg-white rounded-lg shadow p-4 flex-1">
          <svg width={WIDTH} height={HEIGHT} className="bg-gray-50 border border-gray-200 rounded-lg">
            {/* Draw edges */}
            {graph.edges.map((edge, i) => {
              const from = nodePositions[edge.from];
              const to = nodePositions[edge.to];
              if (!from || !to) return null;
              
              const isHighlighted = isEdgeHighlighted(edge.from, edge.to);
              
              return (
                <g key={`edge-${i}`}>
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={isHighlighted ? '#10b981' : '#d1d5db'}
                    strokeWidth={isHighlighted ? 3 : 2}
                    strokeLinecap="round"
                  />
                  <text
                    x={(from.x + to.x) / 2}
                    y={(from.y + to.y) / 2 - 10}
                    textAnchor="middle"
                    fill={isHighlighted ? '#059669' : '#6b7280'}
                    fontSize="14"
                    fontWeight={isHighlighted ? "bold" : "normal"}
                  >
                    {edge.weight}
                  </text>
                </g>
              );
            })}
            
            {/* Draw nodes */}
            {graph.nodes.map((node) => {
              const pos = nodePositions[node];
              if (!pos) return null;
              
              const isActive = isNodeActive(node);
              const isInSolution = isNodeInFinalSolution(node);
              
              let fillColor = '#fff';
              if (isActive) fillColor = '#fef08a'; // Yellow for active
              else if (isInSolution) fillColor = '#bbf7d0'; // Green for solution
              
              return (
                <g key={`node-${node}`}>
                  <motion.circle
                    cx={pos.x}
                    cy={pos.y}
                    r={25}
                    fill={fillColor}
                    stroke={isInSolution ? '#16a34a' : '#000'}
                    strokeWidth={isInSolution ? 3 : 2}
                    animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.5 }}
                  />
                  <text
                    x={pos.x}
                    y={pos.y + 5}
                    textAnchor="middle"
                    fill="#000"
                    fontSize="16"
                    fontWeight="bold"
                  >
                    {node}
                  </text>
                </g>
              );
            })}
          </svg>
          
          {/* Step explanation */}
          {steps.length > 0 && currentStep < steps.length && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800">Current Action:</h3>
              <p>{steps[currentStep].explanation}</p>
            </div>
          )}
        </div>
        
        <div className="w-full md:w-96">
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h3 className="font-bold text-lg mb-2">Progress</h3>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 bg-gray-200 rounded-full flex-1">
                {steps.length > 0 && (
                  <div 
                    className="h-2 bg-blue-600 rounded-full" 
                    style={{ width: `${(currentStep + 1) / steps.length * 100}%` }}
                  ></div>
                )}
              </div>
              <span className="text-sm font-medium">
                {steps.length > 0 ? `${currentStep + 1}/${steps.length}` : '0/0'}
              </span>
            </div>
          </div>
          
          {/* Final solution */}
          {(finalPath.length > 0 || finalEdges.length > 0) && (
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <h3 className="font-bold text-lg text-green-800 mb-2">Final Solution</h3>
              {algorithm === 'dijkstra' && finalPath.length > 0 && (
                <div>
                  <p className="font-medium">Path: {finalPath.join(' → ')}</p>
                  <p className="mt-2">Total Cost: {totalCost}</p>
                </div>
              )}
              {algorithm === 'prims' && finalEdges.length > 0 && (
                <div>
                  <p className="font-medium">MST Edges:</p>
                  <ul className="list-disc list-inside mt-1">
                    {finalEdges.map((edge, i) => (
                      <li key={i}>{edge.from} — {edge.to}</li>
                    ))}
                  </ul>
                  <p className="mt-2">Total Cost: {totalCost}</p>
                </div>
              )}
              <p className="mt-2 text-sm italic">{explanation}</p>
            </div>
          )}
          
          {/* Algorithm steps log */}
          <div className="bg-white rounded-lg shadow p-4 max-h-64 overflow-y-auto">
            <h3 className="font-bold text-lg mb-2">Algorithm Steps</h3>
            {steps.length > 0 ? (
              <ul className="space-y-1">
                {steps.slice(0, currentStep + 1).map((step, i) => (
                  <li 
                    key={i} 
                    className={`p-1 rounded ${i === currentStep ? 'bg-yellow-100' : ''}`}
                  >
                    <span className="text-gray-500 text-xs">{i+1}.</span> {step.explanation}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No steps recorded yet. Click Start to begin.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}