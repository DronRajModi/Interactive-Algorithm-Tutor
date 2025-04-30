import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Visualizer({ selectedAlgorithm }) {
  const [steps, setSteps] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [arrayInput, setArrayInput] = useState('');
  const [speed, setSpeed] = useState(1000); // ms
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);

  // Auto playback effect
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

      {/* Visualization box */}
      <div className="border rounded p-6 shadow-md min-h-[200px] flex flex-col items-center justify-center">
        <div className="space-y-6">
          {steps.slice(0, currentIndex + 1).map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center space-y-2"
            >
              <div className="flex flex-wrap justify-center gap-4">
                {step.array.map((group, groupIdx) => (
                  <div key={groupIdx} className="flex gap-1">
                    {(Array.isArray(group) ? group : [group]).map((val, valIdx) => (
                      <div key={valIdx} className="px-3 py-2 bg-gray-100 border rounded">
                        {val}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div className="text-sm text-gray-500 italic">{step.message}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
