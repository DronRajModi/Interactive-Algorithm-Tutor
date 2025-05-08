import React, { useState, useEffect, useRef } from 'react';
import Graph from './Graphs/Graph';
import Control from './Graphs/Control';
import PseudocodePanel from './PseudocodePanel';

const WIDTH = 600, HEIGHT = 400;

export default function GreedyVisualizer({ algorithm }) {
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [finalPath, setFinalPath] = useState([]);
  const [finalEdges, setFinalEdges] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [nodePositions, setNodePositions] = useState({});
  const [explanation, setExplanation] = useState('');
  const [pseudocode, setPseudocode] = useState([]);
  const intervalRef = useRef(null);
  const currentLine = currentStep?.line ?? null;

  function calculateNodePositions(nodes) {
    const positions = {};
    const cx = WIDTH / 2, cy = HEIGHT / 2, r = Math.min(WIDTH, HEIGHT) * 0.35;
    nodes.forEach((n, i) => {
      const a = (i / nodes.length) * Math.PI * 2;
      positions[n] = { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
    });
    return positions;
  }
  useEffect(() => {
    const fetchPseudocode = async () => {
      try {
        const response = await fetch(`http://localhost:5000/pseudocode/${algorithm}`);
        if (response.ok) {
          const data = await response.json();
          setPseudocode(data);  // Set pseudocode state with fetched data
        } else {
          setPseudocode([]);
        }
      } catch (error) {
        console.error('Error fetching pseudocode:', error);
        setPseudocode([]);
      }
    };

    if (algorithm) {
      fetchPseudocode();
    }
  }, [algorithm]);


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
    // reset
    setIsPlaying(false);
    clearInterval(intervalRef.current);
    setCurrentStep(0);
    setSteps([]);
    setFinalPath([]);
    setFinalEdges([]);
    setTotalCost(0);
    setExplanation('');
    setIsRunning(true);

    const arr = userInput.trim().split(/\s+/).map(Number).filter(n => !isNaN(n));
    const body = arr.length ? { array: arr } : {};
    fetch(`http://localhost:5000/run-greedy-${algorithm}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    }).then(r => {
      if (!r.ok) throw new Error();
      const es = new EventSource('http://localhost:5000/stream');

      es.onmessage = e => {
        const d = JSON.parse(e.data);
        switch (d.type) {
          case 'init':
            setGraph({ nodes: d.nodes, edges: d.edges });
            setNodePositions(calculateNodePositions(d.nodes));
            break;
          case 'visit':
          case 'update':
          case 'include':
            setSteps(prev => {
              if (prev.length === 0) { setIsPlaying(true); setCurrentStep(0); }
              return [...prev, d];
            });
            break;
          case 'final':
            if (d.path) {
              setFinalPath(d.path.split('->').map(Number));
              setTotalCost(d.cost);
              setExplanation(d.explanation);
            } else if (d.mst) {
              const esArr = (d.mst.match(/\((\d+)-(\d+)\)/g) || [])
                .map(p => { const [_, f, t] = p.match(/\((\d+)-(\d+)\)/); return { from: +f, to: +t }; });
              setFinalEdges(esArr);
              setTotalCost(d.cost);
              setExplanation(d.explanation);
            }
            break;
          case 'end':
          case 'error':
            es.close();
            setIsRunning(false);
            break;
        }
      };
      es.onerror = () => { es.close(); setIsRunning(false); };
    })
      .catch(() => { alert('Error'); setIsRunning(false); });
  };

  const handlePause = () => { setIsPlaying(false); clearInterval(intervalRef.current); };
  const handleReset = () => { setIsPlaying(false); clearInterval(intervalRef.current); setCurrentStep(0); };
  const handleLast = () => {
    setIsPlaying(false); clearInterval(intervalRef.current);
    if (steps.length) setCurrentStep(steps.length - 1);
  };

  const isEdgeHighlighted = (f, t) => {
    if (algorithm === 'dijkstra') {
      for (let i = 0; i < finalPath.length - 1; i++) {
        if ((finalPath[i] === f && finalPath[i + 1] === t) || (finalPath[i] === t && finalPath[i + 1] === f)) return true;
      }
    } else {
      return finalEdges.some(e => (e.from === f && e.to === t) || (e.from === t && e.to === f));
    }
    return false;
  };

  const isNodeActive = n => steps[currentStep]?.node === n;
  const isNodeInFinalSolution = n =>
    (algorithm === 'dijkstra' && finalPath.includes(n)) ||
    (algorithm === 'prims' && finalEdges.some(e => e.from === n || e.to === n));

  return (
    <div className="p-5 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">{algorithm.toUpperCase()} VISUALIZER</h1>
      <div className="flex-row">


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
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="bg-white rounded-lg shadow p-4 flex-1">
          <Graph
            width={WIDTH} height={HEIGHT}
            nodes={graph.nodes} edges={graph.edges}
            nodePositions={nodePositions}
            isEdgeHighlighted={isEdgeHighlighted}
            isNodeActive={isNodeActive}
            isNodeInFinalSolution={isNodeInFinalSolution}
          />

          {steps.length > 0 && currentStep < steps.length && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800">Current Action:</h3>
              <p>{steps[currentStep].explanation}</p>
            </div>
          )}

          {(finalPath.length > 0 || finalEdges.length > 0) && (
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold text-lg text-green-800 mb-2">Final Solution</h3>
              {algorithm === 'dijkstra' && finalPath.length > 0 && (
                <>
                  <p className="font-medium">Path: {finalPath.join(' → ')}</p>
                  <p>Total Cost: {totalCost}</p>
                </>
              )}
              {algorithm === 'prims' && finalEdges.length > 0 && (
                <>
                  <p className="font-medium">MST Edges:</p>
                  <ul className="list-disc list-inside">
                    {finalEdges.map((e, i) => <li key={i}>{e.from}—{e.to}</li>)}
                  </ul>
                  <p>Total Cost: {totalCost}</p>
                </>
              )}
              <p className="italic mt-2 text-sm">{explanation}</p>
            </div>
          )}
        </div>

        <div className="w-full md:w-96 space-y-4">
          {/* <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold text-lg mb-2">Progress</h3>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 bg-gray-200 rounded-full flex-1">
                {steps.length>0 && (
                  <div className="h-2 bg-blue-600 rounded-full"
                    style={{width:`${(currentStep+1)/steps.length*100}%`}}
                  />
                )}
              </div>
             
            </div>
          </div> */}
          <PseudocodePanel pseudocodeLines={pseudocode} currentLine={currentLine} />


          <div className="bg-white rounded-lg shadow p-4 max-h-64 overflow-y-auto">
            <span className="text-sm font-medium flex justify-between items-center mb-2">
              <h3 className="font-bold text-lg mb-2">Algorithm Steps</h3>
              {steps.length > 0 ? `${currentStep + 1}/${steps.length}` : '0/0'}

            </span>
            {steps.length > 0 ? (
              <ul className="space-y-1">
                {steps.slice(0, currentStep + 1).map((s, i) => (
                  <li key={i} className={`p-1 rounded ${i === currentStep ? 'bg-yellow-100' : ''}`}>
                    <span className="text-gray-500 text-xs">{i + 1}.</span> {s.explanation}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No steps yet. Click Start.</p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
