const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path')

const app = express();
app.use(cors());
app.use(express.json());

let clients = []; // all connected EventSource clients
let lastSortChoice = '';
let userArray = [];

// 1. POST request to run sorting
app.post('/run-:algorithm', (req, res) => {
  const { algorithm } = req.params;
  userArray = req.body.array || [];
  lastSortChoice = algorithm;
  console.log(`Starting sort for: ${algorithm}, userArray: ${userArray}`);
  res.sendStatus(200);
  
  startSortingProcess();
});

// 2. EventSource stream
app.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  clients.push(res);

  req.on('close', () => {
    clients = clients.filter(c => c !== res);
  });
});

// 3. Start C++ process and stream data
function startSortingProcess() {
  if (!lastSortChoice) return;

  const args = [lastSortChoice, ...userArray];
  const executablePath = path.resolve(__dirname, 'algorithms', 'SortingAlgorithm.exe');
  const process = spawn(executablePath, args);


  process.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    for (const line of lines) {
      if (line.trim()) {
        clients.forEach(client => {
          client.write(`data: ${line.trim()}\n\n`);
        });
      }
    }
  });

  process.on('close', (code) => {
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
