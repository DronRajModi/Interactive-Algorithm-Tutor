import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PseudocodePanel from './PseudocodePanel';

export default function Visualizer({ selectedAlgorithm }) {
  const [steps, setSteps] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [arrayInput, setArrayInput] = useState('');
  const [speed, setSpeed] = useState(1000);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);
  const [pseudocode, setPseudocode] = useState([]);  // State for pseudocode

  useEffect(() => {
    
    const fetchPseudocode = async () => {
      try {
        const response = await fetch(`http://localhost:5000/pseudocode/${selectedAlgorithm}`);
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

    if (selectedAlgorithm) {
      fetchPseudocode();  
    }
  }, [selectedAlgorithm]);  

  useEffect(() => {
    if (isPlaying && currentIndex < steps.length - 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((i) => i + 1);
      }, speed);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, currentIndex, speed, steps]);

  const handleRun = async () => {
    setSteps([]);
    setCurrentIndex(0);
    setIsPlaying(false);

    const inputArray = arrayInput.trim()
      ? arrayInput.split(',').map(Number)
      : undefined;

    await fetch(`http://localhost:5000/run-${selectedAlgorithm}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ array: inputArray }),
    });

    const eventSource = new EventSource('http://localhost:5000/stream');
    const received = [];

    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data);
      received.push(data);
      setSteps([...received]);
    };

    eventSource.addEventListener('end', () => {
      const last = received[received.length - 1];
      const finalStep = {
        action: 'final',
        array: last?.array ?? [],
        message: 'Sorting complete',
      };
      received.push(finalStep);
      setSteps([...received]);
      eventSource.close();
      setCurrentIndex(0);
      setIsPlaying(true);
    });
  };

  const currentStep = steps[currentIndex];
  const isSwapping = ['swap', 'pivot-swap'].includes(currentStep?.action);
  const currentLine = currentStep?.line ?? null;

  return (
    <div className="p-4 w-full space-y-6">
      <h2 className="text-xl font-bold">
        Algorithm: <span className="text-blue-600">{selectedAlgorithm}</span>
      </h2>

      {/* Controls */}
      <div className="flex gap-4 items-center flex-wrap">
        <input
          type="text"
          placeholder="Enter array (e.g. 5,3,2)"
          className="border p-2 rounded w-72"
          value={arrayInput}
          onChange={(e) => setArrayInput(e.target.value)}
        />
        <label className="flex items-center gap-2">
          Speed:
          <input
            type="range"
            min="100"
            max="2000"
            step="100"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
        </label>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleRun}>
          Start
        </button>
        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={() => setIsPlaying(true)}>
          Play
        </button>
        <button className="bg-yellow-600 text-white px-4 py-2 rounded" onClick={() => setIsPlaying(false)}>
          Pause
        </button>
        <button className="bg-gray-600 text-white px-4 py-2 rounded" onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))}>
          Prev
        </button>
        <button className="bg-gray-600 text-white px-4 py-2 rounded" onClick={() => setCurrentIndex((i) => Math.min(i + 1, steps.length - 1))}>
          Next
        </button>
      </div>

      {/* Main layout */}
      <div className="flex w-full gap-4">
        {/* Visualizer */}
        <div className="border rounded p-6 shadow-md min-h-[200px] flex-1 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {currentStep && (
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center space-y-6"
              >
                {/* Array display */}
                <div className="flex flex-wrap justify-center gap-2 relative">
                  {currentStep.array.map((val, i) => {
                    const isPivot = currentStep.pivotIndex === i;
                    const isSwapA = currentStep.swap?.[0] === i;
                    const isSwapB = currentStep.swap?.[1] === i;
                    return (
                      <motion.div
                        key={i}
                        layout
                        className={`px-4 py-2 rounded border font-medium ${isPivot ? 'bg-blue-200' : ''}`}
                        initial={isSwapping && (isSwapA || isSwapB) ? { y: -10 } : false}
                        animate={isSwapping && (isSwapA || isSwapB) ? { y: 0 } : false}
                        transition={{ duration: 0.4 }}
                      >
                        {val}
                      </motion.div>
                    );
                  })}
                </div>

                {isSwapping && <div className="text-2xl mt-2">↔️</div>}

                <div className="text-sm text-gray-600 italic bg-blue-50 border-l-4 border-blue-400 px-4 py-2 w-full max-w-lg text-center">
                  <strong>Step:</strong> {currentStep.message}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Final history panel */}
          {currentStep?.action === 'final' && (
            <div className="mt-6 border rounded shadow-md bg-white max-h-[400px] overflow-y-auto p-4 w-full">
              <h3 className="text-lg font-semibold mb-2 text-center text-green-700">
                 Final Sorted Array
              </h3>
              <div className="flex justify-center flex-wrap gap-2 mb-4">
                {currentStep.array.map((v, i) => (
                  <div key={i} className="px-3 py-1 border rounded bg-green-100 shadow text-sm font-medium">
                    {v}
                  </div>
                ))}
              </div>
              <h4 className="text-md font-semibold mb-2 text-gray-700 text-center"> Step History</h4>
              <div className="space-y-4">
                {steps.map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="flex space-x-2 justify-center flex-wrap">
                      {step.array.map((v, i) => (
                        <div key={i} className="px-3 py-1 border rounded bg-gray-100 shadow-sm text-sm">
                          {v}
                        </div>
                      ))}
                    </div>
                    <div className="text-gray-500 text-xs italic mt-1 text-center max-w-sm">
                      {step.message}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>        

        {/* Pseudocode */}
<PseudocodePanel pseudocodeLines={pseudocode} currentLine={currentLine} />
      </div>
    </div>
  );
}