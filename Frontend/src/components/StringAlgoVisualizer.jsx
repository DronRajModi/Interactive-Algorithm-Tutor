import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

const DEFAULT_PATTERN = 'ABABCABAB';

export default function StringAlgoVisualizer() {
  const [output, setOutput] = useState([]);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [inputText, setInputText] = useState('');
  const [inputPattern, setInputPattern] = useState('');
  const [text, setText] = useState('');
  const [pattern, setPattern] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const intervalRef = useRef(null);

  const startVisualization = () => {
    // Reset
    setSteps([]);
    setOutput([]);
    setCurrentStep(0);
    setIsPlaying(true);
    setIsStarted(true);

    // If user provided their own pattern, use it for initial render; otherwise we'll
    // fall back to our known default once we see the first backend step.
    if (inputPattern.trim() !== '') {
      setPattern(inputPattern.trim());
    }

    fetchSteps(inputText, inputPattern, 'string-kmp');
  };

  const fetchSteps = (textVal, patternVal, algorithm) => {
    const hasInput = textVal.trim() !== '' || patternVal.trim() !== '';
    const body = hasInput
      ? { array: [textVal.trim(), patternVal.trim()] }
      : {};

    fetch(`http://localhost:5000/run-${algorithm}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const eventSource = new EventSource('http://localhost:5000/stream');

    eventSource.onmessage = (e) => {
      try {
        const json = JSON.parse(e.data);
        setSteps((prev) => {
          if (prev.length === 0) {
            // Always set the incoming text
            setText(json.text);
            // If backend provided a pattern, use it; else if user didn't type one, use default
            if (json.pattern) {
              setPattern(json.pattern);
            } else if (inputPattern.trim() === '') {
              setPattern(DEFAULT_PATTERN);
            }
          }
          return [...prev, json];
        });
      } catch {
        setOutput((prev) => [...prev, e.data]);
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
        setCurrentStep((prev) => prev + 1);
      }, speed);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, currentStep, speed, steps]);

  const step = steps[currentStep] || {};

  const reset = () => {
    setIsStarted(false);
    setIsPlaying(false);
    setCurrentStep(0);
    clearInterval(intervalRef.current);
  };

  const renderCharacter = (char, idx, highlightIndex, isPattern = false) => {
    const isHighlighted = idx === highlightIndex;
    const isMatching =
      isStarted &&
      step.l != null &&
      step.r != null &&
      (isPattern ? idx === step.r : idx === step.l);

    let bgColor = 'bg-white';
    let textColor = 'text-gray-900';
    if (isHighlighted) {
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
    }
    if (isMatching) {
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
    }

    return (
      <div key={idx} className="flex flex-col items-center w-8">
        <div className="text-xs text-gray-500">{idx}</div>
        <motion.div
          className={`px-2 py-1 border rounded text-center ${bgColor} ${textColor}`}
          layout
          initial={{ scale: 1 }}
          animate={{
            scale: isHighlighted || isMatching ? 1.1 : 1,
            backgroundColor: isMatching
              ? '#dcfce7'
              : isHighlighted
              ? '#dbeafe'
              : '#ffffff',
          }}
          transition={{ duration: 0.3 }}
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

  const renderNumberGrid = (arr, highlightIndex, label) => (
    <div className="mb-4">
      <h3 className="mb-2 text-gray-800 font-medium">{label}</h3>
      <div className="flex space-x-1 text-sm overflow-x-auto pb-2 pt-2">
        {arr.map((num, idx) => renderNumberCell(num, idx, highlightIndex))}
      </div>
    </div>
  );

  const renderGrid = (str, highlightIndex, label, isPattern = false) => (
    <div className="mb-6">
      <h3 className="mb-2 text-gray-800 font-medium">{label}</h3>
      <div className="flex space-x-1 text-sm overflow-x-auto pb-2 pt-2">
        {str.split('').map((char, idx) =>
          renderCharacter(char, idx, highlightIndex, isPattern)
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          KMP String Matching Algorithm Visualizer
        </h2>
        {isStarted && (
          <button
            onClick={reset}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {!isStarted ? (
        <div className="space-y-4 bg-gray-100 p-4 rounded-lg">
          <div className="space-y-2">
            <label className="block text-gray-700">
              Text String (leave empty for default):
            </label>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full border px-3 py-2 rounded bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ABKBDABACDABABCABLB"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-gray-700">
              Pattern to Search (leave empty for default):
            </label>
            <input
              type="text"
              value={inputPattern}
              onChange={(e) => setInputPattern(e.target.value)}
              className="w-full border px-3 py-2 rounded bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ABABCABAB"
            />
          </div>
          <button
            onClick={startVisualization}
            className="w-full bg-blue-600 px-4 py-2 rounded-md text-white font-medium hover:bg-blue-700 transition-colors"
          >
            Start Visualization
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4 flex gap-4 items-center flex-wrap bg-gray-100 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-gray-800 flex-1">
              <span>Speed:</span>
              <input
                type="range"
                min="100"
                max="2000"
                step="100"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full"
              />
              <span className="text-sm">{(speed / 1000).toFixed(1)}s</span>
            </div>
            <div className="flex gap-2">
              <button
                className={`${
                  isPlaying ? 'bg-yellow-600' : 'bg-green-600'
                } text-white px-4 py-2 rounded-md`}
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button
                className="bg-gray-500 text-white px-3 py-2 rounded-md hover:bg-gray-600"
                onClick={() =>
                  setCurrentStep((prev) => Math.max(prev - 1, 0))
                }
                disabled={currentStep === 0}
              >
                Prev
              </button>
              <button
                className="bg-gray-500 text-white px-3 py-2 rounded-md hover:bg-gray-600"
                onClick={() =>
                  setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
                }
                disabled={currentStep === steps.length - 1}
              >
                Next
              </button>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <div className="text-gray-600 mb-2">
              Step {currentStep + 1} of {steps.length}
            </div>
            {step.message && (
              <div className="text-green-700 text-sm font-mono p-2 bg-green-50 rounded border border-green-200">
                {step.message}
              </div>
            )}
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            {step.lps && renderNumberGrid(step.lps, step.l, 'LPS Array')}
            {renderGrid(pattern, step.r, 'Pattern', true)}
            {renderGrid(text, step.l, 'Text', false)}
          </div>
        </>
      )}
    </div>
  );
}
