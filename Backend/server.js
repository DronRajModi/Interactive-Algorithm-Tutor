const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

const ALGO_DIR = path.join(__dirname, 'algorithms');

function spawnAlgorithm(exeName) {
  const cmd =
    process.platform === 'win32'
      ? `${exeName}.exe`
      : `./${exeName}`;
  return spawn(cmd, [], { cwd: ALGO_DIR });
}

function sseHandler(executableName) {
  return (req, res) => {
    const cppProcess = spawnAlgorithm(executableName);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    cppProcess.stdout.on('data', (chunk) => {
      chunk.toString().split(/\r?\n/).forEach((line) => {
        if (line.trim()) {
          res.write(`data: ${line.trim()}\n\n`);
        }
      });
    });

    cppProcess.stderr.on('data', (data) => {
      console.error(`[${executableName}] stderr: ${data}`);
    });

    cppProcess.on('close', (code) => {
      res.write(`event: end\ndata: ${executableName} complete\n\n`);
      res.end();
    });
  };
}

// Existing endpoints
app.get('/run-merge-sort',    sseHandler('mergeSort'));
app.get('/run-quick-sort',    sseHandler('quickSort'));

// New endpoints for all sorts
app.get('/run-bubble-sort',    sseHandler('bubbleSort'));
app.get('/run-selection-sort', sseHandler('selectionSort'));
app.get('/run-insertion-sort', sseHandler('insertionSort'));
app.get('/run-heap-sort',      sseHandler('heapSort'));
app.get('/run-counting-sort',  sseHandler('countingSort'));
app.get('/run-radix-sort',     sseHandler('radixSort'));
app.get('/run-bucket-sort',    sseHandler('bucketSort'));

app.listen(PORT, () => {
  console.log(`🚀 Server listening at http://localhost:${PORT}`);
});