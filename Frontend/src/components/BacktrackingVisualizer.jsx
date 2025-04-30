import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BacktrackingVisualizer() {
    const [steps, setSteps] = useState([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [size, setSize] = useState(8);
    const [speed, setSpeed] = useState(1000);
    const [isPlaying, setIsPlaying] = useState(false);
    const [finalBoard, setFinalBoard] = useState(null);
    const [showHistory, setShowHistory] = useState(false); // ✅ used for both animation end & "Last"

    const eventSourceRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        if (isPlaying && currentStepIndex < steps.length - 1) {
            animationRef.current = setTimeout(() => {
                setCurrentStepIndex((prev) => {
                    const next = prev + 1;
                    if (next === steps.length - 1) {
                        // ✅ Automatically show history when animation ends
                        setTimeout(() => setShowHistory(true), speed + 50);
                    }
                    return next;
                });
            }, speed);
        } else if (currentStepIndex >= steps.length - 1) {
            setIsPlaying(false);
        }
        return () => clearTimeout(animationRef.current);
    }, [isPlaying, currentStepIndex, steps, speed]);

    const handleRun = async () => {
        reset();
        await fetch('http://localhost:5000/run-n-queen', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ array: [size] }),
        });

        const eventSource = new EventSource('http://localhost:5000/stream');
        eventSourceRef.current = eventSource;

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setSteps((prev) => [...prev, data]);
            if (data.message?.includes("Solution found")) {
                setFinalBoard(data.board);
            }
        };

        eventSource.addEventListener('end', () => {
            eventSource.close();
            setIsPlaying(true);
        });
    };

    const reset = () => {
        setSteps([]);
        setCurrentStepIndex(0);
        setFinalBoard(null);
        setIsPlaying(false);
        setShowHistory(false);
        if (eventSourceRef.current) eventSourceRef.current.close();
        clearTimeout(animationRef.current);
    };

    const handleLast = () => {
        setIsPlaying(false);
        setCurrentStepIndex(steps.length - 1);
        setShowHistory(true); // ✅ Explicitly show history on "Last"
    };

    const renderBoard = (board, highlightRow, highlightCol, placing) => {
        if (!board) return null;

        return (
            <div
                className="grid gap-1"
                style={{
                    gridTemplateColumns: `repeat(${size}, minmax(20px, 1fr))`,
                    width: 'fit-content',
                    margin: '0 auto',
                }}
            >
                {board.map((row, rIdx) =>
                    row.split('').map((cell, cIdx) => {
                        const isHighlight = highlightRow === rIdx && highlightCol === cIdx;
                        const bg =
                            cell === 'Q'
                                ? 'bg-purple-400'
                                : isHighlight
                                    ? placing
                                        ? 'bg-green-200'
                                        : 'bg-red-200'
                                    : 'bg-white';

                        return (
                            <motion.div
                                key={`${rIdx}-${cIdx}-${cell}`}
                                className={`w-8 h-8 border flex items-center justify-center ${bg}`}
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.2 }}
                            >
                                {cell === 'Q' ? '♛' : ''}
                            </motion.div>
                        );
                    })
                )}
            </div>
        );
    };

    const currentStep = steps[currentStepIndex];

    return (
        <div className="p-4 max-w-screen-lg mx-auto">
            <h2 className="text-xl font-bold mb-4">N-Queens Visualization</h2>

            <div className="flex items-center gap-4 mb-4 flex-wrap">
                <label>
                    Size:
                    <input
                        type="number"
                        min={4}
                        max={16}
                        value={size}
                        onChange={(e) => setSize(Number(e.target.value))}
                        className="ml-2 border px-2 py-1 rounded w-16"
                    />
                </label>

                <label>
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
                <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={() => setIsPlaying(true)} disabled={isPlaying || steps.length === 0}>
                    Play
                </button>
                <button className="bg-yellow-600 text-white px-4 py-2 rounded" onClick={() => setIsPlaying(false)} disabled={!isPlaying}>
                    Pause
                </button>
                <button className="bg-purple-600 text-white px-4 py-2 rounded" onClick={handleLast} disabled={steps.length === 0}>
                    Last
                </button>
                <button className="bg-gray-700 text-white px-4 py-2 rounded" onClick={reset}>
                    Reset
                </button>
            </div>

            <div className="mb-6 text-center">
                <h3 className="text-sm text-gray-500">Step {currentStepIndex + 1} of {steps.length}</h3>
                <AnimatePresence mode="wait">
                    {currentStep && (
                        <motion.div
                            key={currentStepIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {renderBoard(currentStep.board, currentStep.row, currentStep.col, currentStep.placing)}
                            <div className="mt-2 italic text-gray-600 text-sm">{currentStep.message}</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>



            {showHistory && (
                <div className="max-h-[400px] overflow-y-auto border rounded p-2 bg-gray-50 mt-4">
                    {finalBoard && currentStepIndex === steps.length - 1 && (
                        <div className="text-center mb-4 ">
                            <h3 className="text-lg font-semibold text-green-600 mb-2">✅ Final Solution</h3>
                            {renderBoard(finalBoard)}
                        </div>
                    )}
                    {steps.map((step, index) => (
                        <div key={index} className="mb-4">
                            <div className="text-center text-sm text-gray-600 font-medium mb-1">
                                Step {index + 1}
                            </div>
                            {renderBoard(step.board, step.row, step.col, step.placing)}
                            <div className="mt-1 text-center italic text-gray-600">{step.message}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
