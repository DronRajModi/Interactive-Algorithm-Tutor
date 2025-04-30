import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Visualizer({ selectedAlgorithm }) {
  const [steps, setSteps] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [arrayInput, setArrayInput] = useState('');
  const [speed, setSpeed] = useState(1000); // in ms
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (isRunning && currentIndex < steps.length - 1) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => prev + 1);
      }, speed);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, currentIndex, speed, steps]);

  const handleRun = async () => {
    setSteps([]);
    setCurrentIndex(0);
    setIsRunning(false);

    const inputArray = arrayInput.trim()
      ? arrayInput.trim().split(',').map(Number)
      : undefined;

    await fetch(`http://localhost:5000/run-${selectedAlgorithm}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ array: inputArray }),
    });

    const eventSource = new EventSource('http://localhost:5000/stream');
    const newSteps = [];

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      newSteps.push(data);
      setSteps([...newSteps]);
    };

    eventSource.addEventListener('end', () => {
      eventSource.close();
      setIsRunning(true);
    });
  };

  return (
    <div className="p-4 w-full space-y-4">
      <h2 className="text-xl font-bold">Selected Algorithm: <span className="text-blue-600">{selectedAlgorithm}</span></h2>

      <div className="flex gap-4 items-center">
        <input
          type="text"
          placeholder="Enter array (e.g. 5,3,2)"
          className="border p-2 rounded w-72"
          value={arrayInput}
          onChange={(e) => setArrayInput(e.target.value)}
        />
        <label>
          Speed:
          <input
            type="range"
            min="100"
            max="2000"
            step="100"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="ml-2"
          />
        </label>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={handleRun}
        >
          Start
        </button>
      </div>

      <div className="space-y-8">
        {steps.slice(0, currentIndex + 1).map((step, index) => (
          <motion.div
            key={index}
            className="flex flex-col items-start space-y-1 border p-2 rounded shadow-md"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex space-x-1">
              {step.array.map((val, idx) => (
                <div
                  key={idx}
                  className="px-3 py-2 bg-gray-100 border rounded"
                >
                  {val}
                </div>
              ))}
            </div>
            <div className="text-sm text-gray-500 italic">{step.message}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
