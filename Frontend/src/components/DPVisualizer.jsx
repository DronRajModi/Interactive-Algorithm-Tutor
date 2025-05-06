import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DPVisualizerAnimated({ algorithm }) {
  const [dpMatrix, setDpMatrix] = useState([]);
  const [currentStep, setCurrentStep] = useState(null);
  const [stepQueue, setStepQueue] = useState([]);
  const [speed, setSpeed] = useState(500);
  const [runId, setRunId] = useState(0);
  const eventRef = useRef(null);

  // Inputs
  const [fibInput, setFibInput] = useState('10');
  const [cap, setCap] = useState('10');
  const [weights, setWeights] = useState('2,3,4,5');
  const [values, setValues] = useState('3,4,5,6');

  // Reset state
  const reset = () => {
    setDpMatrix([]);
    setCurrentStep(null);
    setStepQueue([]);
    if (eventRef.current) {
      eventRef.current.close();
      eventRef.current = null;
    }
  };

  // Start button handler
  const handleStart = () => {
    reset();
    setRunId(id => id + 1);
  };

  // Reset when algorithm changes
  useEffect(() => {
    reset();
    setRunId(0);
  }, [algorithm]);

  // SSE + trigger backend on each runId increment
  useEffect(() => {
    if (runId === 0) return;

    // Build parameters
    let params = [];
    if (algorithm === 'dp-fibonacci') {
      params = [parseInt(fibInput, 10) || 0];
    } else {
      const wArr = weights.split(',').map(n => parseInt(n, 10));
      const vArr = values.split(',').map(n => parseInt(n, 10));
      params = [parseInt(cap, 10), wArr.length, ...wArr, ...vArr];
    }

    // Send POST
    fetch(`http://localhost:5000/run-${algorithm}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ array: params })
    });

    // Open SSE
    const es = new EventSource('http://localhost:5000/stream');
    eventRef.current = es;

    es.onmessage = e => {
      const data = e.data.trim();
      if (!data.startsWith('{')) return;
      let obj;
      try {
        obj = JSON.parse(data);
      } catch {
        return;
      }
      // Filter unwanted
      if (algorithm === 'dp-fibonacci' && obj.message === 'Fibonacci complete') return;
      if (algorithm === 'dp-knapsack' && !('dpRow' in obj)) return;
      if (algorithm === 'dp-fibonacci' && !('result' in obj)) return;
      setStepQueue(q => [...q, obj]);
    };
    es.addEventListener('end', () => es.close());

    return () => es.close();
  }, [runId, algorithm]);

  // Process each queued step
  useEffect(() => {
    if (!currentStep && stepQueue.length) {
      const [step, ...rest] = stepQueue;
      setStepQueue(rest);

      if (algorithm === 'dp-fibonacci') {
        setDpMatrix(prev => {
          const row = prev[0] ? [...prev[0]] : [];
          row.push(step.result);
          return [row];
        });
      } else {
        setDpMatrix(prev => {
          const rows = Math.max(prev.length, step.step + 1);
          const cols = step.dpRow.length;
          const m = Array.from({ length: rows }, (_, i) =>
            i < prev.length ? [...prev[i]] : Array(cols).fill(0)
          );
          m[step.step] = step.dpRow;
          return m;
        });
      }

      setCurrentStep(step);
      setTimeout(() => setCurrentStep(null), speed);
    }
  }, [stepQueue, currentStep, speed, algorithm]);

  const display = algorithm.replace('dp-', '');

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold capitalize mb-4">{display} Visualization</h2>

      {/* Controls */}
      <div className="mb-4 space-y-2">
        {algorithm === 'dp-fibonacci' && (
          <div>
            <label>n:</label>
            <input type="number" value={fibInput} onChange={e => setFibInput(e.target.value)} className="border ml-2 p-1 w-20" />
          </div>
        )}
        {algorithm === 'dp-knapsack' && (
          <>
            <label>cap:</label>
            <input value={cap} onChange={e => setCap(e.target.value)} className="border ml-2 p-1 w-16" />
            <label className="ml-4">weights:</label>
            <input value={weights} onChange={e => setWeights(e.target.value)} className="border ml-2 p-1 w-40" />
            <label className="ml-4">values:</label>
            <input value={values} onChange={e => setValues(e.target.value)} className="border ml-2 p-1 w-40" />
          </>
        )}
        <div>
          <label>Speed: {speed}ms</label>
          <input type="range" min="100" max="2000" step="100" value={speed} onChange={e => setSpeed(+e.target.value)} className="ml-2" />
        </div>
        <button onClick={handleStart} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Start
        </button>
      </div>

      {/* Visualization Table */}
      {runId > 0 && (
        <table className="table-auto border-collapse mb-2">
          <tbody>
            {dpMatrix.map((row, i) => (
              <tr key={i}>
                {row.map((v, j) => {
                  let bg = '#fff';
                  if (algorithm === 'dp-fibonacci' && currentStep && 'prevIndices' in currentStep) {
                    const dpLen = dpMatrix[0]?.length || 0;
                    if (currentStep.prevIndices.includes(j)) bg = '#facc15';
                    else if (j === dpLen - 1) bg = '#ef4444';
                  }
                  if (algorithm === 'dp-knapsack' && currentStep?.step === i && currentStep.weight === j) {
                    bg = currentStep.decision === 'include' ? '#bbf7d0' : '#fecaca';
                  }
                  return (
                    <motion.td key={j} className="border p-2 text-center" animate={{ backgroundColor: bg }} transition={{ duration: 0.5 }}>
                      {v}
                    </motion.td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Step Info */}
      <AnimatePresence>
        {currentStep && (
          <motion.div key={JSON.stringify(currentStep)} className="p-2 bg-gray-100 rounded" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            {algorithm === 'dp-fibonacci'
              ? currentStep.prevIndices
                ? `Sum indices ${currentStep.prevIndices[0]} + ${currentStep.prevIndices[1]} = ${currentStep.result}`
                : currentStep.message
              : `Step ${currentStep.step}: W=${currentStep.weight}, ${currentStep.decision}, val=${currentStep.currentValue}`
            }
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}