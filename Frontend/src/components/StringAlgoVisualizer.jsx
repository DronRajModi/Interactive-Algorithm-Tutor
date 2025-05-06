import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

export default function StringAlgoVisualizer({ algorithm }) {
  const [output, setOutput] = useState([]);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  // user inputs (optional)
  const [inputText, setInputText] = useState('');
  const [inputPattern, setInputPattern] = useState('');

  // actual values used for visualization, populated from SSE
  const [text, setText] = useState('');
  const [pattern, setPattern] = useState('');

  const [isPlaying, setIsPlaying] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const intervalRef = useRef(null);

  const startVisualization = () => {
    setSteps([]);
    setOutput([]);
    setCurrentStep(0);
    setIsPlaying(true);
    setIsStarted(true);

    // Pass whatever user typed, or let backend pick its defaults
    const trimmedText = inputText.trim();
    const trimmedPattern = inputPattern.trim();

    fetchSteps(trimmedText, trimmedPattern, algorithm);
  };

  const fetchSteps = (textVal, patternVal, algorithm) => {
    // build request body only if user provided something
    const body =
      textVal !== '' || patternVal !== ''
        ? { array: [textVal, patternVal] }
        : {};

    // map our prop name to your endpoint slug
    const endpoint = algorithm === 'string-kmp' ? 'kmp' : 'rabin';

    fetch(`http://localhost:5000/run-string-${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const eventSource = new EventSource('http://localhost:5000/stream');

    eventSource.onmessage = (e) => {
      try {
        const json = JSON.parse(e.data);

        // on the very first JSON message, capture defaults from backend:
        setSteps(prev => {
          if (prev.length === 0) {
            if (json.text) setText(json.text);
            if (json.pattern) setPattern(json.pattern);
          }
          return [...prev, json];
        });
      } catch {
        // non-JSON lines (like log or debug) go into output
        setOutput(prev => [...prev, e.data]);
      }
    };

    eventSource.addEventListener('end', () => {
      eventSource.close();
      setCurrentStep(0);
      setIsPlaying(true);
    });

    return () => eventSource.close();
  };

  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      intervalRef.current = setInterval(() => {
        setCurrentStep(prev => prev + 1);
      }, speed);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, currentStep, speed, steps]);

  const reset = () => {
    clearInterval(intervalRef.current);
    setIsStarted(false);
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const step = steps[currentStep] || {};

  const renderCharacter = (char, idx, highlightIndex, isPattern = false) => {
    const isHighlighted = idx === highlightIndex;
    const isMatching =
      isStarted &&
      step.l != null &&
      step.r != null &&
      (isPattern ? idx === step.r : idx === step.l);

    let bg = 'bg-white text-gray-900';
    if (isHighlighted) bg = 'bg-blue-100 text-blue-800';
    if (isMatching) bg = 'bg-green-100 text-green-800';

    return (
      <div key={idx} className="flex flex-col items-center w-8">
        <div className="text-xs text-gray-500">{idx}</div>
        <motion.div
          className={`px-2 py-1 border rounded text-center ${bg}`}
          layout
          initial={{ scale: 1 }}
          animate={{ scale: isHighlighted || isMatching ? 1.1 : 1 }}
          transition={{ duration: 0.2 }}
        >
          {char}
        </motion.div>
      </div>
    );
  };

  const renderNumberCell = (num, idx, highlightIndex) => {
    const isHighlighted = idx === highlightIndex;
    return (
      <div key={idx} className="flex flex-col items-center w-8">
        <div className="text-xs text-gray-500">{idx}</div>
        <div
          className={`px-2 py-1 border rounded text-center ${
            isHighlighted ? 'bg-blue-100 text-blue-800' : 'bg-white text-gray-900'
          }`}
        >
          {num}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          {algorithm === 'string-kmp'
            ? 'KMP String Matching Algorithm Visualizer'
            : 'Rabin-Karp String Matching Algorithm Visualizer'}
        </h2>
        {isStarted && (
          <button
            onClick={reset}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Reset
          </button>
        )}
      </div>

      {/* Input & Start */}
      {!isStarted ? (
        <div className="space-y-4 bg-gray-100 p-4 rounded">
          <div>
            <label className="block text-gray-700 mb-1">Text String:</label>
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="leave empty for default"
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Pattern:</label>
            <input
              type="text"
              value={inputPattern}
              onChange={e => setInputPattern(e.target.value)}
              placeholder="leave empty for default"
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={startVisualization}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Start Visualization
          </button>
        </div>
      ) : (
        <>
          {/* Controls */}
          <div className="flex items-center gap-4 bg-gray-100 p-4 rounded mb-4 flex-wrap">
            <div className="flex items-center gap-2 flex-1">
              <span>Speed:</span>
              <input
                type="range"
                min="100"
                max="2000"
                step="100"
                value={speed}
                onChange={e => setSpeed(+e.target.value)}
                className="flex-1"
              />
              <span className="text-sm">{(speed / 1000).toFixed(1)}s</span>
            </div>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-4 py-2 rounded text-white ${
                isPlaying ? 'bg-yellow-600' : 'bg-green-600'
              }`}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              onClick={() => setCurrentStep(s => Math.max(s - 1, 0))}
              disabled={currentStep === 0}
              className="px-3 py-2 bg-gray-500 text-white rounded disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() =>
                setCurrentStep(s => Math.min(s + 1, steps.length - 1))
              }
              disabled={currentStep === steps.length - 1}
              className="px-3 py-2 bg-gray-500 text-white rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>

          {/* Progress & Message */}
          <div className="bg-gray-100 p-4 rounded mb-4">
            <div className="text-gray-600 mb-2">
              Step {currentStep + 1} of {steps.length}
            </div>
            {step.message && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-2 rounded text-sm font-mono">
                {step.message}
              </div>
            )}
          </div>

          {/* Visualization */}
          <div className="bg-gray-100 p-4 rounded space-y-6">
            {step.lps && (
              <div>
                <h3 className="text-gray-800 font-medium mb-2">LPS Array</h3>
                <div className="flex space-x-1 overflow-x-auto pb-2">
                  {step.lps.map((num, idx) =>
                    renderNumberCell(num, idx, step.l)
                  )}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-gray-800 font-medium mb-2">Pattern</h3>
              <div className="flex space-x-1 overflow-x-auto pb-2">
                {pattern.split('').map((char, idx) =>
                  renderCharacter(char, idx, step.r, true)
                )}
              </div>
            </div>

            <div>
              <h3 className="text-gray-800 font-medium mb-2">Text</h3>
              <div className="flex space-x-1 overflow-x-auto pb-2">
                {text.split('').map((char, idx) =>
                  renderCharacter(char, idx, step.l, false)
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
