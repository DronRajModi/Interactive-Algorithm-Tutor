All of the actual sorting work happens in your C++ program—mergeSort.cpp is the one doing the recursive splits, comparisons and writes. Your React component, Visualizer.jsx, never re-implements merge-sort; it simply:

Opens an SSE connection to your Node SSE endpoint (/run-merge-sort).

Listens for each JSON-encoded step (split, compare, write, etc.) that mergeSort.cpp emits.

Renders those steps as animated bars and boxes in the browser.

So:

Merge Sort Logic: lives exclusively in mergeSort.cpp.

Visualization & Animation: lives exclusively in Visualizer.jsx (plus Framer Motion/Tailwind).

Data Transport: your Node.js server pipes the C++ stdout into SSE, and React reads it.

React never sorts the array itself—it just paints whatever array state and indices the C++ logs tell it.






