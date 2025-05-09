# Interactive Algorithm Tutor

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Tech Stack](https://img.shields.io/badge/Stack-C++%20%7C%20React-blue)

An interactive, educational platform that visualizes core algorithm concepts using **C++** for backend processing and **React** for the frontend interface. Ideal for students and CS enthusiasts learning:

- **Sorting Algorithms**: Merge Sort, Quick Sort, Bubble Sort, Insertion Sort, Selection Sort, Radix Sort, Counting Sort  
- **Greedy Algorithms**: Dijkstra's, Prim's, Kruskal's  
- **String Matching**: KMP, Rabin-Karp  
- **Backtracking**: Nqueen, Hamiltonian Cycle  
- **Dynamic Programming**: Fibonacci Series, Knapsack  
- *(...with more to come!)*

---

## 📸 Visual Demos

Here are some previews of the visualizations available in the app:

<p align="center">
  <img src="./Frontend/src/assets/Screenshot 2025-05-07 111518.png" width="250" />
  <img src="./Frontend/src/assets/Screenshot 2025-05-07 111940.png" width="250" />
  <br/>
  <img src="./Frontend/src/assets/Screenshot 2025-05-07 112233.png" width="250" />
  <img src="./Frontend/src/assets/Screenshot 2025-05-09 135411.png" width="250" />
  <img src="./mnt/data/4300461e-8ef4-4417-986b-38f149ec874c.png" width="250" />
  <img src="./Frontend/src/assets/Screenshot 2025-05-07 111755.png" width="250" />
</p>

---

## 🔭 Future Work

- Add more algorithm categories like more **Algos of Dynamic Programming, Backtracking, and more**
- Display and support **full code execution** for each algorithm to enhance learning
- Blog section for detailed write-ups to deepen understanding

---

## 🌟 Features

- 🎥 **Step-by-step algorithm visualization** with highlighted pseudocode
- 🧠 **Concept-focused** design for learning, not just showcasing code
- ⚙️ **C++ backend** to simulate actual algorithm behavior
- 🖼️ **React + Tailwind CSS** frontend with clean, responsive design

---

## 🧰 Tech Stack

- **C++** — Implements the core logic for all algorithms (sorting, graph, string matching, etc.)
- **Node.js** — Acts as a bridge between the C++ backend and the React frontend. It handles I/O and manages real-time streaming.
- **SSE (Server-Sent Events)** — Enables real-time one-way communication from server to frontend. The backend streams JSON-formatted algorithm steps (like array states or pointer positions) to the React UI using SSE via `EventSource`, allowing smooth, live visualizations.
- **React.js** — Renders an interactive and modular user interface, reacting to SSE updates to animate algorithm behavior step-by-step
- **Tailwind CSS** — Used for rapid, responsive, and clean UI styling

---

## 🚀 Getting Started

### 1️⃣ Fork and Clone the Repository

First, fork this repo and then clone it:

```bash
git clone https://github.com/Ayansh0209/Interactive-Algorithm-Tutor.git
cd Interactive-Algorithm-Tutor

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Go back to root and install shared packages (if any)
cd ..
npm install

# Then run the development server
npm start
