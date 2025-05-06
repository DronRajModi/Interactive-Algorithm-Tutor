import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const WIDTH = 600;
const HEIGHT = 400;

export default function GraphAlgorithmVisualizer() {
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
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

  // Simulate fetching data from the backend
  const fetchData = () => {
    setSteps([]);
    setCurrentStep(0);
    setFinalPath([]);
    setFinalEdges([]);
    setTotalCost(0);
    setExplanation('');

    // Parse user input or use default graph
    let edges = [];
    if (userInput.trim()) {
      const values = userInput.trim().split(/\s+/).map(Number);
      if (values.length % 3 === 0) {
        for (let i = 0; i < values.length; i += 3) {
          edges.push({ from: values[i], to: values[i + 1], weight: values[i + 2] });
        }
      } else {
        alert('Input should be triplets of "from to weight"');
        return;
      }
    } else {
      // Default graph as in the image
      edges = [
        { from: 0, to: 1, weight: 4 },
        { from: 0, to: 2, weight: 1 },
        { from: 1, to: 2, weight: 2 },
        { from: 1, to: 3, weight: 5 },
        { from: 2, to: 3, weight: 8 }
      ];
    }

    // Extract unique nodes
    const nodes = [...new Set(edges.flatMap(edge => [edge.from, edge.to]))];
    
    // Calculate positions
    const positions = calculateNodePositions(nodes);
    setNodePositions(positions);
    
    // Set initial graph
    setGraph({ nodes, edges });

    // Simulate algorithm execution
    simulateAlgorithmExecution(nodes, edges);
  };

  const simulateAlgorithmExecution = (nodes, edges) => {
    // Create an adjacency list representation
    const adjacencyList = {};
    nodes.forEach(node => {
      adjacencyList[node] = [];
    });
    
    edges.forEach(edge => {
      adjacencyList[edge.from].push({ to: edge.to, weight: edge.weight });
      adjacencyList[edge.to].push({ to: edge.from, weight: edge.weight }); // Undirected graph
    });
    
    if (algorithm === 'dijkstra') {
      runDijkstraSimulation(nodes, adjacencyList);
    } else {
      runPrimsSimulation(nodes, adjacencyList);
    }
  };

  const runDijkstraSimulation = (nodes, adjacencyList) => {
    const simulatedSteps = [];
    const dist = {};
    const prev = {};
    const visited = new Set();
    const start = Math.min(...nodes);
    const end = Math.max(...nodes);
    
    // Initialize distances
    nodes.forEach(node => {
      dist[node] = Infinity;
    });
    dist[start] = 0;
    
    // Priority queue simulation
    let queue = [{ node: start, distance: 0 }];
    
    while (queue.length > 0) {
      // Get node with minimum distance
      queue.sort((a, b) => a.distance - b.distance);
      const { node: u, distance: d } = queue.shift();
      
      if (visited.has(u)) continue;
      visited.add(u);
      
      simulatedSteps.push({
        type: 'visit',
        node: u,
        value: d,
        explanation: `Visiting node ${u} with distance ${d}`
      });
      
      // Process neighbors
      adjacencyList[u].forEach(edge => {
        const v = edge.to;
        const weight = edge.weight;
        
        if (!visited.has(v) && dist[u] + weight < dist[v]) {
          dist[v] = dist[u] + weight;
          prev[v] = u;
          queue.push({ node: v, distance: dist[v] });
          
          simulatedSteps.push({
            type: 'update',
            node: v,
            value: dist[v],
            explanation: `Updated distance to node ${v} to ${dist[v]}`
          });
        }
      });
    }
    
    // Reconstruct path
    const path = [];
    let current = end;
    
    if (prev[current] !== undefined || current === start) {
      while (current !== undefined) {
        path.unshift(current);
        current = prev[current];
      }
      
      setFinalPath(path);
      setTotalCost(dist[end]);
      setExplanation(`Shortest path found with total cost ${dist[end]}`);
    } else {
      setExplanation(`No path exists to node ${end}`);
    }
    
    setSteps(simulatedSteps);
  };

  const runPrimsSimulation = (nodes, adjacencyList) => {
    const simulatedSteps = [];
    const key = {};
    const parent = {};
    const inMST = {};
    const start = Math.min(...nodes);
    
    // Initialize keys
    nodes.forEach(node => {
      key[node] = Infinity;
      inMST[node] = false;
    });
    key[start] = 0;
    
    // Priority queue simulation
    let queue = nodes.map(node => ({ node, key: key[node] }));
    
    let totalMSTCost = 0;
    const mstEdges = [];
    
    while (queue.length > 0) {
      // Get node with minimum key
      queue.sort((a, b) => a.key - b.key);
      const { node: u } = queue.shift();
      
      if (inMST[u]) continue;
      inMST[u] = true;
      
      if (u !== start) {
        mstEdges.push({ from: parent[u], to: u });
        totalMSTCost += key[u];
      }
      
      simulatedSteps.push({
        type: 'include',
        node: u,
        value: key[u],
        explanation: `Added node ${u} to MST with cost ${u === start ? 0 : key[u]}`
      });
      
      // Update keys of adjacent nodes
      adjacencyList[u].forEach(edge => {
        const v = edge.to;
        const weight = edge.weight;
        
        if (!inMST[v] && weight < key[v]) {
          key[v] = weight;
          parent[v] = u;
          
          // Update the node in the queue
          const index = queue.findIndex(item => item.node === v);
          if (index !== -1) {
            queue[index].key = weight;
          }
          
          simulatedSteps.push({
            type: 'update',
            node: v,
            value: weight,
            explanation: `Updated key of node ${v} to ${weight}`
          });
        }
      });
    }
    
    setFinalEdges(mstEdges);
    setTotalCost(totalMSTCost);
    setExplanation(`MST complete with total cost ${totalMSTCost}`);
    setSteps(simulatedSteps);
  };

  useEffect(() => {
    if (isPlaying) {
      if (currentStep < steps.length - 1) {
        intervalRef.current = setInterval(() => {
          setCurrentStep(prev => {
            if (prev < steps.length - 1) return prev + 1;
            clearInterval(intervalRef.current);
            return prev;
          });
        }, speed);
      } else {
        setIsPlaying(false);
      }
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, steps, currentStep, speed]);

  const handleStart = () => {
    fetchData();
    setIsPlaying(true);
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
            placeholder="Leave empty for default graph"
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <button 
          onClick={handleStart} 
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Start
        </button>
        <button 
          onClick={handlePause} 
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
        >
          Pause
        </button>
        <button 
          onClick={handleReset} 
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Reset
        </button>
        <button 
          onClick={handleLast} 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
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