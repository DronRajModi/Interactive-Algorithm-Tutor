import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PseudocodePanel from './PseudocodePanel';

// Define your pseudocode for each algorithm
const pseudocodeMap = {
  'merge-sort': [
    'function mergeSort(arr)',
    '  if arr.length > 1',
    '    mid = arr.length / 2',
    '    L = left half, R = right half',
    '    mergeSort(L), mergeSort(R)',
    '    merge L and R into arr'
  ],
  'quick-sort': [
    'function quicksort(arr, low, high)',
    '  if low < high',
    '    pi = partition(arr, low, high)',
    '    quicksort(arr, low, pi - 1)',
    '    quicksort(arr, pi + 1, high)'
  ],
  'bubble-sort': [
    'for i = 0 to n-1',
    '  for j = 0 to n-i-1',
    '    if arr[j] > arr[j+1]',
    '      swap arr[j] and arr[j+1]'
  ]
};

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
        setCurrentIndex((i) => i + 1);
      }, speed);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, currentIndex, speed, steps]);

  const handleRun = async () => {
    // reset everything
    setSteps([]);
    setCurrentIndex(0);
    setIsPlaying(false);

    // parse input
    const inputArray = arrayInput.trim()
      ? arrayInput.split(',').map(Number)
      : undefined;

    // start backend
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
      // inject final step
      const last = received[received.length - 1];
      const finalStep = {
        action: 'final',
        array: last?.array ?? [],
        message: 'Sorting complete'
      };
      received.push(finalStep);
      setSteps([...received]);

      // close and start playing
      eventSource.close();
      setCurrentIndex(0);
      setIsPlaying(true);
    });
  };

  const currentStep = steps[currentIndex];
  const isSwapping = ['swap','pivot-swap'].includes(currentStep?.action);
  const pseudocodeLines = pseudocodeMap[selectedAlgorithm] || [];
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
        <button className="bg-gray-600 text-white px-4 py-2 rounded" onClick={() => setCurrentIndex(i => Math.max(i - 1, 0))}>
          Prev
        </button>
        <button className="bg-gray-600 text-white px-4 py-2 rounded" onClick={() => setCurrentIndex(i => Math.min(i + 1, steps.length - 1))}>
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
                  {currentStep.array.map((val,i) => {
                    const isPivot = currentStep.pivotIndex === i;
                    const isSwapA = currentStep.swap?.[0]===i;
                    const isSwapB = currentStep.swap?.[1]===i;
                    const isCount = currentStep.action==='count' && currentStep.swap?.[0]===i;
                    const isPrefix = currentStep.action==='prefix' && currentStep.swap?.[0]===i;
                    const isPlace = currentStep.action==='place' && (currentStep.swap?.[0]===i||currentStep.swap?.[1]===i);
                    const isDigit = currentStep.action==='digit' && currentStep.swap?.[1]===i;
                    let bg='bg-gray-100';
                    if(isPivot) bg='bg-blue-200 border-blue-600';
                    else if(isSwapA||isSwapB) bg='bg-yellow-200 border-yellow-600';
                    else if(isCount) bg='bg-green-200 border-green-600';
                    else if(isPrefix) bg='bg-indigo-200 border-indigo-600';
                    else if(isPlace) bg='bg-purple-300 border-purple-600';
                    else if(isDigit) bg='bg-orange-200 border-orange-600';
                    return (
                      <motion.div
                        key={i}
                        layout
                        className={`px-4 py-2 rounded border font-medium ${bg}`}
                        initial={isSwapping&&(isSwapA||isSwapB)?{y:-10}:false}
                        animate={isSwapping&&(isSwapA||isSwapB)?{y:0}:false}
                        transition={{duration:0.4}}
                      >
                        {val}
                      </motion.div>
                    );
                  })}
                </div>

                {isSwapping && <div className="text-2xl mt-2">↔️</div>}

                {(currentStep.action==='count'||currentStep.action==='prefix'||currentStep.action==='place') && (
                  <div className="flex flex-wrap justify-center gap-2 border-t pt-4">
                    {Array.from({length:10}).map((_,i)=>(
                      <div
                        key={i}
                        className={`w-10 h-10 text-center leading-10 border rounded ${
                          currentStep.swap?.[0]===i?'bg-green-300':'bg-white'
                        }`}
                      >{i}</div>
                    ))}
                  </div>
                )}

                <div className="text-sm text-gray-600 italic bg-blue-50 border-l-4 border-blue-400 px-4 py-2 w-full max-w-lg text-center">
                  <strong>Step:</strong> {currentStep.message}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Final history panel */}
          {currentStep?.action==='final' && (
            <div className="mt-6 border rounded shadow-md bg-white max-h-[400px] overflow-y-auto p-4 w-full">
              <h3 className="text-lg font-semibold mb-2 text-center text-green-700">
                ✅ Final Sorted Array
              </h3>
              <div className="flex justify-center flex-wrap gap-2 mb-4">
                {currentStep.array.map((v,i)=>(
                  <div key={i} className="px-3 py-1 border rounded bg-green-100 shadow text-sm font-medium">
                    {v}
                  </div>
                ))}
              </div>
              <h4 className="text-md font-semibold mb-2 text-gray-700 text-center">📜 Step History</h4>
              <div className="space-y-4">
                {steps.map((step,idx)=>(
                  <div key={idx} className="flex flex-col items-center">
                    <div className="flex space-x-2 justify-center flex-wrap">
                      {step.array.map((v,i)=>(
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
        <PseudocodePanel
          pseudocodeLines={pseudocodeLines}
          currentLine={currentLine}
        />
      </div>
    </div>
  );
}
