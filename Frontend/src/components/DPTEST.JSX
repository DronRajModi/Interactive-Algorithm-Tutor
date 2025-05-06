import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DPVisualizerAnimated({ algorithm }) {
  // Animation & data states
  const [dpMatrix, setDpMatrix] = useState([]);
  const [currentStep, setCurrentStep] = useState(null);
  const [stepQueue, setStepQueue] = useState([]);
  const [started, setStarted] = useState(false);
  const [meta, setMeta] = useState(null);
  const [speed, setSpeed] = useState(500); // milliseconds per step

  // Knapsack-specific inputs
  const [capacityStr, setCapacityStr] = useState('10');
  const [weightsStr, setWeightsStr] = useState('2,3,4,5');
  const [valuesStr, setValuesStr] = useState('3,4,5,6');

  const [fibInput, setFibInput] = useState('10');

  const eventSourceRef = useRef(null);

  // Helper to reset state before each run
  const resetState = () => {
    setDpMatrix([]);
    setCurrentStep(null);
    setStepQueue([]);
    setMeta(null);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  // Reset when algorithm changes
  useEffect(() => {
    setStarted(false);
    resetState();
  }, [algorithm]);

  // Start or restart visualization
  const handleStart = () => {
    resetState();
    setStarted(true);
  };

  // When "started" changes, open SSE and POST
  useEffect(() => {
    if (!started || !algorithm) return;

    // Build params dynamically
    let params = [];
    if (algorithm === 'dp-knapsack') {
      const capacity = parseInt(capacityStr, 10);
      const weights = weightsStr.split(',').map(s => parseInt(s.trim(), 10));
      const values = valuesStr.split(',').map(s => parseInt(s.trim(), 10));
      params = [capacity, weights.length, ...weights, ...values];
    } else if (algorithm === 'dp-fibonacci') {
      const n = parseInt(fibInput, 10) || 10;
      params = [n];
    }

    // Trigger backend
    fetch(`http://localhost:5000/run-${algorithm}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ array: params }),
    });

    // Open SSE
    const evt = new EventSource(`http://localhost:5000/stream`);
    eventSourceRef.current = evt;

    evt.onmessage = (e) => {
      try {
        const obj = JSON.parse(e.data);
        if (obj.action === 'start') {
          setMeta(obj);
        } else if (algorithm === 'dp-knapsack' && obj.dpRow) {
          setStepQueue(q => [...q, obj]);
        } else if (algorithm === 'dp-fibonacci' && 'n' in obj) {
          setStepQueue(q => [...q, obj]);
        }
      } catch (err) {
        console.error('Parse error', err);
      }
    };

    evt.addEventListener('end', () => {
      evt.close();
      eventSourceRef.current = null;
    });

    return () => {
      evt.close();
      eventSourceRef.current = null;
    };
  }, [started, algorithm]);

  // Process step queue with speed control
  useEffect(() => {
    if (!currentStep && stepQueue.length) {
      const [next, ...rest] = stepQueue;
      setStepQueue(rest);

      if (algorithm === 'dp-knapsack') {
        setDpMatrix(prev => {
          const rows = Math.max(prev.length, next.step + 1);
          const cols = next.dpRow.length;
          const newMat = Array.from({ length: rows }, (_, i) =>
            i < prev.length ? [...prev[i]] : Array(cols).fill(0)
          );
          newMat[next.step] = next.dpRow;
          return newMat;
        });
      } else if (algorithm === 'dp-fibonacci') {
        setDpMatrix(prev => [...prev, [next.result]]);
      }

      setCurrentStep(next);
      setTimeout(() => setCurrentStep(null), speed);
    }
  }, [stepQueue, currentStep, speed, algorithm]);

  const displayName = algorithm.replace(/^dp-/, '').replace('-', ' ');

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold capitalize mb-4">{displayName} Visualization</h2>

      {/* Controls */}
      <div className="mb-4 space-y-3">
        {algorithm === 'dp-knapsack' && (
          <>
            <div>
              <label className="block text-sm">Bag Capacity:</label>
              <input type="number" value={capacityStr} onChange={e => setCapacityStr(e.target.value)} className="border p-1 rounded w-32" />
            </div>
            <div>
              <label className="block text-sm">Weights (comma-separated):</label>
              <input type="text" value={weightsStr} onChange={e => setWeightsStr(e.target.value)} className="border p-1 rounded w-full" />
            </div>
            <div>
              <label className="block text-sm">Values (comma-separated):</label>
              <input type="text" value={valuesStr} onChange={e => setValuesStr(e.target.value)} className="border p-1 rounded w-full" />
            </div>
          </>
        )}

        {algorithm === 'dp-fibonacci' && (
          <div>
            <label className="block text-sm">Fibonacci n:</label>
            <input type="number" value={fibInput} onChange={e => setFibInput(e.target.value)} className="border p-1 rounded w-32" />
          </div>
        )}

        <div>
          <label className="block text-sm">Speed: {speed}ms</label>
          <input type="range" min="100" max="2000" step="100" value={speed} onChange={e => setSpeed(parseInt(e.target.value, 10))} className="w-full" />
        </div>

        <button onClick={handleStart} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Start
        </button>
      </div>

      {meta && algorithm === 'dp-knapsack' && (
        <div className="mb-4 text-sm">
          <strong>Max Weight:</strong> {meta.maxWeight} | <strong>Items:</strong> {meta.items}
        </div>
      )}

      {started && (
        <>
          <table className="table-auto border-collapse mb-4">
            <tbody>
              {dpMatrix.map((row, i) => (
                <tr key={i}>
                  {row.map((val, j) => {
                    const highlightCell =
                      algorithm === 'dp-knapsack'
                        ? currentStep?.step === i && currentStep?.weight === j
                        : currentStep && i === dpMatrix.length - 1;
                    const include = algorithm === 'dp-knapsack'
                      ? highlightCell && currentStep?.decision === 'include'
                      : true;
                    const bg = highlightCell
                      ? include ? '#bbf7d0' : '#fecaca'
                      : '#fff';
                    return (
                      <motion.td key={j} className="border p-2 text-center" animate={{ backgroundColor: bg }} transition={{ duration: 0.5 }}>
                        {val}
                      </motion.td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <AnimatePresence>
            {currentStep && (
              <motion.div
                key={algorithm === 'dp-knapsack' ? `${currentStep.step}-${currentStep.weight}` : currentStep.n}
                className="mt-4 p-2 bg-gray-100 rounded"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                {algorithm === 'dp-knapsack' ? (
                  <strong>
                    Step {currentStep.step}:
                  </strong>
                ) : (
                  <strong>n={currentStep.n}:</strong>
                )}{" "}
                {algorithm === 'dp-knapsack'
                  ? `Item ${currentStep.step} (W=${currentStep.weight}), Decision: ${currentStep.decision}, Value: ${currentStep.currentValue}`
                  : currentStep.message || `F(${currentStep.n}) = ${currentStep.result}`}
              </motion.div>

            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
