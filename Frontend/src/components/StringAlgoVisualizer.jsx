import { useEffect, useState } from 'react';

export default function StringAlgoVisualizer({ algorithm }) {
  const [output, setOutput] = useState([]);

  useEffect(() => {
    if (!algorithm) return;

    fetch(`http://localhost:5000/run-${algorithm}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ array: [] }) // Add test cases later
    });

    const eventSource = new EventSource('http://localhost:5000/stream');

    eventSource.onmessage = (e) => {
      setOutput((prev) => [...prev, e.data]);
    };

    eventSource.addEventListener('end', () => {
      eventSource.close();
    });

    return () => {
      eventSource.close();
    };
  }, [algorithm]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold capitalize mb-4">{algorithm} Output</h2>
      <pre className="bg-gray-100 p-4 rounded text-sm whitespace-pre-wrap">
        {output.join('\n')}
      </pre>
    </div>
  );
}
