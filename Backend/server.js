const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

let clients = [];
let lastChoice = '';
let userParams = [];

// 1. POST /run-<algorithm>
app.post('/run-:algorithm', (req, res) => {
  const { algorithm } = req.params;
  lastChoice = algorithm;
  userParams = req.body.array || [];

  console.log(`Running ${algorithm} with params:`, userParams);
  res.sendStatus(200);

  startProcess();
});

// 2. SSE endpoint
app.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  clients.push(res);
  req.on('close', () => {
    clients = clients.filter(c => c !== res);
  });
});

// 3. Launch backend executable
function startProcess() {
  if (!lastChoice) return;

  const algoDir = path.resolve(__dirname, 'algorithms');
  let exePath;
  let args = [];

  switch (lastChoice) {
    case 'dp-fibonacci':
      exePath = path.join(algoDir, 'fibonacci.exe');
      args = userParams.map(String);
      break;
    case 'dp-knapsack':
      exePath = path.join(algoDir, 'knapsack.exe');
      args = userParams.map(String);
      break;
    case 'n-queen':
      exePath = path.join(algoDir, 'Backtracking.exe');
      args = userParams.map(String);
      break;
    case 'string-kmp':
      exePath = path.join(algoDir, 'kmp.exe');
      args = userParams.map(String);
      break;
    case 'string-rabin':
      exePath = path.join(algoDir, 'rabin_karp.exe');
      args = userParams.map(String);
      break;
    default:
      // Generic algorithms
      exePath = path.join(algoDir, 'SortingAlgorithm.exe');
      args = [lastChoice, ...userParams.map(String)];
      break;
  }

  console.log('Spawning:', exePath, 'Args:', args);

  const child = spawn(exePath, args);

  child.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(Boolean);
    lines.forEach(line => {
      clients.forEach(client => client.write(`data: ${line}\n\n`));
    });
  });

  child.on('close', (code) => {
    console.log(`Exited with code ${code}`);
    clients.forEach(c => {
      c.write('event: end\ndata: done\n\n');
      c.end();
    });
    clients = [];
  });

  child.on('error', (err) => {
    console.error('Spawn error:', err);
    clients.forEach(c => {
      c.write(`event: error\ndata: ${JSON.stringify(err.message)}\n\n`);
      c.end();
    });
    clients = [];
  });
}

app.listen(5000, () => console.log('Server running on http://localhost:5000'));
