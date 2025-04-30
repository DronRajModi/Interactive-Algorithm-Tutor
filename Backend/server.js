const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

let clients = [];
let lastSortChoice = '';
let userArray = [];

// 1. POST /run-<algorithm>
app.post('/run-:algorithm', (req, res) => {
  const { algorithm } = req.params;
  userArray = req.body.array || [];
  lastSortChoice = algorithm;

  console.log(`Starting algorithm: ${algorithm}, userArray: ${userArray}`);
  res.sendStatus(200);

  startSortingProcess();
});

// 2. GET /stream — SSE
app.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  clients.push(res);

  req.on('close', () => {
    clients = clients.filter(c => c !== res);
  });
});

// 3. Run the appropriate algorithm
function startSortingProcess() {
  if (!lastSortChoice) return;

  let executable;
  let args = [];

  if (lastSortChoice.startsWith('n-queen')) {
    executable = path.resolve(__dirname, 'algorithms', 'Backtracking.exe');

    if (userArray.length === 1 && Number.isInteger(userArray[0])) {
      args = [userArray[0]]; // Pass just the size (e.g., 8)
    } else {
      console.warn('Invalid board size for N-Queens:', userArray);
      return;
    }

  } else {
    executable = path.resolve(__dirname, 'algorithms', 'SortingAlgorithm.exe');
    args = [lastSortChoice, ...userArray]; // e.g., ["merge", 4, 2, 3, 1]
  }

  console.log('Spawning with args:', args);
  const child = spawn(executable, args.map(String));

  child.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    for (const line of lines) {
      if (line.trim()) {
        clients.forEach(client => {
          client.write(`data: ${line.trim()}\n\n`);
        });
      }
    }
  });

  child.on('close', (code) => {
    console.log(`Child process exited with code ${code}`);
    clients.forEach(client => {
      client.write('event: end\ndata: done\n\n');
      client.end();
    });
    clients = [];
  });
}

app.listen(5000, () => {
  console.log('Backend server running at http://localhost:5000');
});
