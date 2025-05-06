// components/hooks/useSSEStream.js
import { useEffect, useState } from 'react';

const useSSEStream = () => {
  const [streamData, setStreamData] = useState([]);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:5000/stream');

    eventSource.onmessage = (event) => {
      setStreamData(prev => [...prev, event.data]);
    };

    eventSource.addEventListener('end', () => {
      setIsDone(true);
      eventSource.close();
    });

    eventSource.onerror = (err) => {
      console.error('SSE error:', err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return { streamData, isDone };
};

export default useSSEStream;
