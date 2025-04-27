const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.post('/start-sort', (req, res) => {
    const { algorithm } = req.body;

    const cppProcess = spawn('./sorting_app.exe'); // compiled C++ exe name

    // Send the choice number to C++ program
    cppProcess.stdin.write(`${algorithm}\n`);

    // Stream data
    cppProcess.stdout.setEncoding('utf-8');

    cppProcess.stdout.on('data', (data) => {
        // Split multiple JSON objects if they come together
        const steps = data.split('\n').filter(Boolean).map(line => JSON.parse(line));
        steps.forEach(step => {
            res.write(`data: ${JSON.stringify(step)}\n\n`);
        });
    });

    cppProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    cppProcess.on('close', (code) => {
        res.end();
        console.log(`child process exited with code ${code}`);
    });
});

// Use SSE (Server Sent Events)
app.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
