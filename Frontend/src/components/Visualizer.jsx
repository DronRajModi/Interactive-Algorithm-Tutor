import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

let nextId = 1;
function makeNode(array) {
  return { id: nextId++, array, children: [], merging: false };
}

function findLeafContaining(node, targetArr) {
  if (!node) return null;
  if (node.children.length === 0) {
    if (node.array.length >= targetArr.length) {
      const isMatch = targetArr.every((v, i) => node.array[i] === v);
      if (isMatch) {
        return node;
      }
    }
  }
  for (let c of node.children) {
    let found = findLeafContaining(c, targetArr);
    if (found) return found;
  }
  return null;
}

export default function Visualizer({ selectedAlgorithm }) {
  const [root, setRoot] = useState(null);
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(300);
  const [arrayInput, setArrayInput] = useState('');
  const [finalArray, setFinalArray] = useState([]);
  const [startRequested, setStartRequested] = useState(false);
  const esRef = useRef(null);

  useEffect(() => {
    if (startRequested && selectedAlgorithm) {
      startSort(selectedAlgorithm);
    }
    return () => esRef.current && esRef.current.close();
  }, [startRequested]);

  const handleStep = async (step) => {
    if (step.message) {
      setLogs(l => [...l, step.message]);
    }

    if (step.type === 'start') {
      const tree = makeNode(step.array);
      setRoot(tree);
      setFinalArray([]);
    }
    else if (step.type === 'split') {
      setRoot(r => {
        const copy = { ...r };
        function clone(n) {
          return { id: n.id, array: [...n.array], children: n.children.map(clone) };
        }
        const newRoot = clone(r);
        const parent = findLeafContaining(newRoot, [...step.left, ...step.right]);
        if (parent) {
          parent.children.push(makeNode(step.left));
          parent.children.push(makeNode(step.right));
        }
        return newRoot;
      });
    }
    else if (step.type === 'merge') {
      setRoot(r => {
        const copy = { ...r };
        function traverse(n) {
          if (n.children.length > 0) {
            if (
              n.children.length === 2 &&
              [...n.children[0].array, ...n.children[1].array].length === step.array.length
            ) {
              n.children = []; // Remove children
              n.array = [...step.array]; // Merge into parent
              n.merging = true;
              return true;
            }
          }
          for (let c of n.children) {
            if (traverse(c)) return true;
          }
          return false;
        }
        traverse(copy);
        return copy;
      });
    }
    else if (step.type === 'swap' || step.type === 'compare') {
      setRoot(r => {
        const copy = { ...r };
        function traverse(n) {
          if (n.array.length === step.array.length && n.array.every((v, i) => v === step.array[i])) {
            n.array = [...step.array];
            return true;
          }
          for (let c of n.children) {
            if (traverse(c)) return true;
          }
          return false;
        }
        traverse(copy);
        return copy;
      });
    }
    else if (step.type === 'end') {
      setRunning(false);
      setStartRequested(false);
      setFinalArray(step.array);
    }

    await new Promise(res => setTimeout(res, speed));
  };

  const startSort = (algo) => {
    if (running) return;
    setRunning(true);
    setLogs([]);
    setRoot(null);
    setFinalArray([]);

    const payload = arrayInput
      .split(',')
      .map(x => x.trim())
      .filter(x => x !== '')
      .map(Number);

    fetch(`http://localhost:5000/run-${algo}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload.length ? { array: payload } : {})
    });

    const es = new EventSource('http://localhost:5000/stream');
    esRef.current = es;
    es.onmessage = async e => {
      if (!e.data.trim().startsWith('{')) return;
      try {
        const step = JSON.parse(e.data);
        await handleStep(step);
      } catch {
        setLogs(l => [...l, e.data]);
      }
    };
    es.addEventListener('end', () => es.close());
  };

  const Tree = ({ node }) => (
    <div className="flex flex-col items-center relative">
      <motion.div
        layout
        animate={{ scale: node.merging ? [1, 1.2, 1] : 1 }}
        transition={{ duration: 0.5 }}
        className="flex gap-2 p-2 bg-white rounded-lg shadow"
      >
        {node.array.map((v, i) => (
          <motion.div
            layout
            key={i}
            className={`w-12 h-12 flex items-center justify-center rounded-md 
              ${node.pivot === v ? 'bg-yellow-300' : 'bg-gray-200'} font-bold`}
          >
            {v}
          </motion.div>
        ))}
      </motion.div>

      {/* Lines */}
      {node.children.length > 0 && (
        <div className="flex justify-center relative mt-6">
          <svg className="absolute -top-6 left-0 w-full h-6">
            <line
              x1="25%"
              y1="0"
              x2="15%"
              y2="100%"
              stroke="black"
              strokeWidth="2"
            />
            <line
              x1="75%"
              y1="0"
              x2="85%"
              y2="100%"
              stroke="black"
              strokeWidth="2"
            />
          </svg>
          <div className="flex gap-10">
            {node.children.map(child => (
              <Tree key={child.id} node={child} />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center">
        {selectedAlgorithm ? selectedAlgorithm.replace('-', ' ').toUpperCase() : 'Select Algorithm'}
      </h1>

      <div className="flex justify-center gap-4">
        <input
          type="text"
          placeholder="5,3,8,1"
          className="border rounded-md p-2 w-64"
          value={arrayInput}
          onChange={e => setArrayInput(e.target.value)}
          disabled={running}
        />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
          onClick={() => setStartRequested(true)}
          disabled={running || !selectedAlgorithm}
        >
          {running ? 'Running…' : 'Start'}
        </button>
      </div>

      <div className="flex justify-center gap-4 items-center">
        <label className="font-semibold">Speed:</label>
        <input
          type="range"
          min="50"
          max="1000"
          step="50"
          value={speed}
          onChange={e => setSpeed(+e.target.value)}
          disabled={running}
        />
        <span className="font-mono">{speed}ms</span>
      </div>

      <div className="overflow-auto bg-gray-100 p-6 rounded-2xl shadow-inner min-h-[400px]">
        {root ? <Tree node={root} /> : (
          <p className="text-center text-gray-500">Click Start to visualize.</p>
        )}
      </div>

      {finalArray.length > 0 && (
        <div className="text-center mt-10">
          <h2 className="font-bold text-xl mb-2">Final Sorted Array</h2>
          <div className="flex justify-center gap-4">
            {finalArray.map((v, i) => (
              <motion.div
                key={i}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-12 h-12 flex items-center justify-center bg-green-400 text-white font-bold rounded-md"
              >
                {v}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow max-h-48 overflow-y-auto">
        <h2 className="font-semibold mb-2">Logs</h2>
        <ul className="font-mono text-sm space-y-1">
          {logs.map((l, i) => <li key={i}>{l}</li>)}
        </ul>
      </div>
    </div>
  );
}
