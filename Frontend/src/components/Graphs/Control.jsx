import React from 'react';

export default function Control({
  userInput,
  setUserInput,
  onStart,
  onPause,
  onReset,
  onLast,
  isRunning,
  isPlaying,
  stepsLength,
  currentStep,
  speed,
  setSpeed
}) {
  return (
    <div className="flex items-center gap-4 mb-4">
      <input
        type="text"
        value={userInput}
        onChange={e => setUserInput(e.target.value)}
        placeholder='e.g. "0 1 4 1 2 3"'
        className="flex-1 border border-gray-300 p-2 rounded"
      />

      <button
        onClick={onStart}
        disabled={isRunning}
        className={`bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isRunning ? 'Running...' : 'Start'}
      </button>

      <button
        onClick={onPause}
        disabled={!isPlaying}
        className={`bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition ${!isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        Pause
      </button>

      <button
        onClick={onReset}
        disabled={stepsLength === 0}
        className={`bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition ${stepsLength === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        Reset
      </button>

      <button
        onClick={onLast}
        disabled={stepsLength === 0}
        className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition ${stepsLength === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        Last
      </button>

      <div className="flex items-center">
        <span className="mr-2 text-sm">Speed:</span>
        <input
          type="range"
          min={200}
          max={2000}
          step={100}
          value={speed}
          onChange={e => setSpeed(Number(e.target.value))}
          className="w-32"
        />
        <span className="ml-2 text-sm">{speed}ms</span>
      </div>
    </div>
  );
}
