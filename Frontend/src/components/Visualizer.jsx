import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Visualizer({ selectedAlgorithm }) {
  const [steps, setSteps] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [arrayInput, setArrayInput] = useState('');
  const [speed, setSpeed] = useState(1000);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isPlaying && currentIndex < steps.length - 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => prev + 1);
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
    const receivedSteps = [];

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      receivedSteps.push(data);
      setSteps([...receivedSteps]);
    };

    eventSource.addEventListener('end', () => {
      eventSource.close();
      setCurrentIndex(0);
      setIsPlaying(true);
    });
  };

  const currentStep = steps[currentIndex];
  const isSwapping = currentStep?.action === 'swap' || currentStep?.action === 'pivot-swap';

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

      {/* Visualization Box */}
      <div className="border rounded p-6 shadow-md min-h-[200px] flex flex-col items-center justify-center">
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
              {/* Main Array */}
              <div className="flex flex-wrap justify-center gap-2 relative">
                {currentStep.array.map((val, i) => {
                  const isPivot = currentStep.pivotIndex === i;
                  const isSwapA = currentStep.swap?.[0] === i;
                  const isSwapB = currentStep.swap?.[1] === i;
                  const isCount = currentStep.action === 'count' && currentStep.swap?.[0] === i;
                  const isPrefix = currentStep.action === 'prefix' && currentStep.swap?.[0] === i;
                  const isPlace = currentStep.action === 'place' && (currentStep.swap?.[0] === i || currentStep.swap?.[1] === i);
                  const isDigit = currentStep.action === 'digit' && currentStep.swap?.[1] === i;

                  let bgColor = 'bg-gray-100';
                  if (isPivot) bgColor = 'bg-blue-200 border-blue-600';
                  else if (isSwapA || isSwapB) bgColor = 'bg-yellow-200 border-yellow-600';
                  else if (isCount) bgColor = 'bg-green-200 border-green-600';
                  else if (isPrefix) bgColor = 'bg-indigo-200 border-indigo-600';
                  else if (isPlace) bgColor = 'bg-purple-300 border-purple-600';
                  else if (isDigit) bgColor = 'bg-orange-200 border-orange-600';

                  return (
                    <motion.div
                      key={i}
                      layout
                      className={`px-4 py-2 rounded border font-medium ${bgColor}`}
                      initial={isSwapping && (isSwapA || isSwapB) ? { y: -10 } : false}
                      animate={isSwapping && (isSwapA || isSwapB) ? { y: 0 } : false}
                      transition={{ duration: 0.4 }}
                    >
                      {val}
                    </motion.div>
                  );
                })}
              </div>

              {/* Arrows for swap */}
              {isSwapping && (
                <div className="text-center text-2xl mt-2">↔️</div>
              )}

              {/* Count bins (if any) */}
              {(currentStep.action === 'count' || currentStep.action === 'prefix' || currentStep.action === 'place') && (
                <div className="flex flex-wrap justify-center gap-2 border-t pt-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-10 h-10 text-center leading-10 border rounded ${
                        currentStep.swap?.[0] === i ? 'bg-green-300' : 'bg-white'
                      }`}
                    >
                      {i}
                    </div>
                  ))}
                </div>
              )}

              {/* Step message */}
              <div className="text-sm text-gray-600 italic bg-blue-50 border-l-4 border-blue-400 px-4 py-2 w-full max-w-lg text-center">
                <strong>Step:</strong> {currentStep.message}
              </div>

              {/* Final Step History */}
              {currentStep?.action === 'final' && (
                <div className="mt-12 border-t pt-6">
                  <h3 className="text-xl font-semibold mb-4">Full Step History</h3>
                  <div className="space-y-6">
                    {steps.map((step, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <div className="flex space-x-2 justify-center flex-wrap">
                          {step.array.map((val, i) => (
                            <div
                              key={i}
                              className="px-3 py-1 border rounded bg-white shadow text-sm"
                            >
                              {val}
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
