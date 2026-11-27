// =====================================================
//  CPU Scheduling Visualizer
//  Algorithms: FCFS, SJF (non-preemptive), SRTF (preemptive)
// =====================================================


// ---------- 1. Data ----------

let processes = [];       // every process looks like: { name: "P1", arrival: 0, burst: 5 }
let algorithm = "FCFS";   // "FCFS", "SJF", "SRTF" or "ALL" (compare all)
let results = [];         // the results that are on the screen now
let timer = null;         // timer of the step-by-step animation

let colors = ["#6ab7e6", "#e96a97", "#6fdc6f", "#9a7df0", "#e8a866", "#5fd4c8", "#e6d95f", "#dd88e6"];

let fullNames = {
  FCFS: "First-Come, First-Served",
  SJF: "Shortest Job First (non-preemptive)",
  SRTF: "Shortest Remaining Time First (preemptive)"
};

// Textbook examples for the "Load an example" buttons
let examples = [
  // 0: FCFS example (average waiting time = 17)
  [
    { name: "P1", arrival: 0, burst: 24 },
    { name: "P2", arrival: 0, burst: 3 },
    { name: "P3", arrival: 0, burst: 3 }
  ],
  // 1: SJF example (average waiting time = 7)
  [
    { name: "P1", arrival: 0, burst: 6 },
    { name: "P2", arrival: 0, burst: 8 },
    { name: "P3", arrival: 0, burst: 7 },
    { name: "P4", arrival: 0, burst: 3 }
  ],
  // 2: SRTF example (average waiting time = 6.5)
  [
    { name: "P1", arrival: 0, burst: 8 },
    { name: "P2", arrival: 1, burst: 4 },
    { name: "P3", arrival: 2, burst: 9 },
    { name: "P4", arrival: 3, burst: 5 }
  ],
  // 3: processes entered out of order, with idle time
  [
    { name: "P1", arrival: 9, burst: 2 },
    { name: "P2", arrival: 2, burst: 3 },
    { name: "P3", arrival: 4, burst: 1 }
  ]
];


// ---------- 2. The algorithms ----------
// Every algorithm takes a list of processes and returns the Gantt chart
// as a list of blocks: { name, start, end }

// Add 1 ms to the chart. If the last block has the same name, make it longer.
function addOneMs(blocks, name, time) {
  let last = blocks[blocks.length - 1];
  if (blocks.length > 0 && last.name == name) {
    last.end = time + 1;
  } else {
    blocks.push({ name: name, start: time, end: time + 1 });
  }
}

// FCFS: run the processes in order of arrival time
function fcfs(list) {
  // copy the list, then sort the copy by arrival time
  let sorted = list.slice();
  sorted.sort(function (a, b) {
    return a.arrival - b.arrival;
  });

  let blocks = [];
  let time = 0;

  for (let i = 0; i < sorted.length; i++) {
    let p = sorted[i];

    // the process has not arrived yet, so the CPU is idle
    if (time < p.arrival) {
      blocks.push({ name: "IDLE", start: time, end: p.arrival });
      time = p.arrival;
    }

    blocks.push({ name: p.name, start: time, end: time + p.burst });
    time = time + p.burst;
  }

  return blocks;
}

// Used by SJF and SRTF.
// From the processes that have arrived and are not finished,
// return the index of the one with the smallest remaining time.
// If two are equal, the one that arrived first wins.
// Returns -1 when no process is ready.
function pickShortest(list, remaining, time) {
  let best = -1;

  for (let i = 0; i < list.length; i++) {
    if (remaining[i] > 0 && list[i].arrival <= time) {
      if (best == -1) {
        best = i;
      } else if (remaining[i] < remaining[best]) {
        best = i;
      } else if (remaining[i] == remaining[best] && list[i].arrival < list[best].arrival) {
        best = i;
      }
    }
  }

  return best;
}

// SJF: pick the shortest job and run it until it finishes
function sjf(list) {
  let remaining = [];
  for (let i = 0; i < list.length; i++) {
    remaining[i] = list[i].burst;
  }

  let blocks = [];
  let time = 0;
  let finished = 0;

  while (finished < list.length) {
    let i = pickShortest(list, remaining, time);

    if (i == -1) {
      // no process is ready: CPU is idle for 1 ms
      addOneMs(blocks, "IDLE", time);
      time = time + 1;
    } else {
      // run the whole job (no preemption)
      blocks.push({ name: list[i].name, start: time, end: time + list[i].burst });
      time = time + list[i].burst;
      remaining[i] = 0;
      finished = finished + 1;
    }
  }

  return blocks;
}

// SRTF: every 1 ms, run the process with the shortest remaining time
function srtf(list) {
  let remaining = [];
  for (let i = 0; i < list.length; i++) {
    remaining[i] = list[i].burst;
  }

  let blocks = [];
  let time = 0;
  let finished = 0;

  while (finished < list.length) {
    let i = pickShortest(list, remaining, time);

    if (i == -1) {
      addOneMs(blocks, "IDLE", time);
    } else {
      // run this process for 1 ms only, then check again
      addOneMs(blocks, list[i].name, time);
      remaining[i] = remaining[i] - 1;
      if (remaining[i] == 0) {
        finished = finished + 1;
      }
    }

    time = time + 1;
  }

  return blocks;
}


// ---------- 3. The formulas ----------
//   Completion Time (CT) = the time the process finishes
//   Turnaround Time (TAT) = CT - Arrival Time
//   Waiting Time (WT)     = TAT - Burst Time

function calculate(algorithmName, list, blocks) {
  let rows = [];
  let totalWT = 0;
  let totalTAT = 0;
  let busyTime = 0;

  for (let i = 0; i < list.length; i++) {
    let p = list[i];

    // completion time = the end of the last block of this process
    let ct = 0;
    for (let j = 0; j < blocks.length; j++) {
      if (blocks[j].name == p.name) {
        ct = blocks[j].end;
      }
    }

    let tat = ct - p.arrival;
    let wt = tat - p.burst;

    rows.push({ name: p.name, arrival: p.arrival, burst: p.burst, ct: ct, tat: tat, wt: wt });
    totalWT = totalWT + wt;
    totalTAT = totalTAT + tat;
    busyTime = busyTime + p.burst;
  }

  // total time = the end of the last block in the chart
  let totalTime = blocks[blocks.length - 1].end;

  return {
    name: algorithmName,
    blocks: blocks,
    rows: rows,
    totalWT: totalWT,
    avgWT: totalWT / list.length,
    avgTAT: totalTAT / list.length,
    utilization: busyTime / totalTime * 100
  };
}

// Run one algorithm on the current processes
function run(algorithmName) {
  let blocks;
  if (algorithmName == "FCFS") {
    blocks = fcfs(processes);
  } else if (algorithmName == "SJF") {
    blocks = sjf(processes);
  } else {
    blocks = srtf(processes);
  }
  return calculate(algorithmName, processes, blocks);
}


// ---------- 4. Drawing on the page ----------

// Every process gets a color by its position in the list
function getColor(name) {
  for (let i = 0; i < processes.length; i++) {
    if (processes[i].name == name) {
      return colors[i % colors.length];
    }
  }
  return "gray";
}

function colorDot(name) {
  return "<span class='dot' style='background:" + getColor(name) + "'></span>";
}

function showProcessTable() {
  let html = "";

  for (let i = 0; i < processes.length; i++) {
    let p = processes[i];
    html += "<tr>";
    html += "<td>" + colorDot(p.name) + p.name + "</td>";
    html += "<td>" + p.arrival + "</td>";
    html += "<td>" + p.burst + "</td>";
    html += "<td><button onclick='deleteProcess(" + i + ")'>Delete</button></td>";
    html += "</tr>";
  }

  if (processes.length == 0) {
    html = "<tr><td colspan='4'>No processes yet.</td></tr>";
  }

  document.getElementById("processTable").innerHTML = html;
}

// Build the Gantt chart of one result.
// "limit" = how many blocks to show (used by the animation).
function chartHTML(result, limit) {
  let blocks = result.blocks;
  let totalTime = blocks[blocks.length - 1].end;
  let shownTime = 0;

  let html = "<div class='card'>";
  html += "<h2>" + result.name + " <small>" + fullNames[result.name] + "</small></h2>";
  html += "<div class='gantt'>";

  for (let i = 0; i < blocks.length && i < limit; i++) {
    let b = blocks[i];

    let blockClass = "block";
    if (timer != null && i == limit - 1) {
      blockClass = "block new";   // the newest block fades in
    }

    // flex-grow makes a longer block wider
    html += "<div class='" + blockClass + "' style='flex-grow:" + (b.end - b.start) + "'>";
    if (b.name == "IDLE") {
      html += "<div class='box idle'>IDLE</div>";
    } else {
      html += "<div class='box' style='background:" + getColor(b.name) + "'>" + b.name + "</div>";
    }
    html += "<div class='times'><span>" + b.start + "</span><span>" + b.end + "</span></div>";
    html += "</div>";

    shownTime = b.end;
  }

  // empty space for the blocks that are not shown yet
  if (shownTime < totalTime) {
    html += "<div style='flex-grow:" + (totalTime - shownTime) + "'></div>";
  }

  html += "</div></div>";
  return html;
}

function showCharts(limit) {
  let html = "";
  for (let i = 0; i < results.length; i++) {
    html += chartHTML(results[i], limit);
  }
  document.getElementById("charts").innerHTML = html;
}

// Summary cards + results table for one algorithm
function resultsHTML(result) {
  let html = "<div class='kpis'>";
  html += "<div class='card'><div class='muted'>Average Waiting Time</div><div class='kpi-number'>" + result.avgWT.toFixed(2) + " ms</div></div>";
  html += "<div class='card'><div class='muted'>Average Turnaround Time</div><div class='kpi-number'>" + result.avgTAT.toFixed(2) + " ms</div></div>";
  html += "<div class='card'><div class='muted'>CPU Utilization</div><div class='kpi-number'>" + result.utilization.toFixed(2) + " %</div></div>";
  html += "</div>";

  html += "<div class='card'><h2>Results</h2><table>";
  html += "<tr><th>Process</th><th>Arrival Time</th><th>Burst Time</th><th>Completion Time</th><th>Turnaround Time</th><th>Waiting Time</th></tr>";

  for (let i = 0; i < result.rows.length; i++) {
    let r = result.rows[i];
    html += "<tr>";
    html += "<td>" + colorDot(r.name) + r.name + "</td>";
    html += "<td>" + r.arrival + "</td>";
    html += "<td>" + r.burst + "</td>";
    html += "<td>" + r.ct + "</td>";
    html += "<td>" + r.tat + "</td>";
    html += "<td>" + r.wt + "</td>";
    html += "</tr>";
  }

  html += "</table></div>";
  return html;
}

// Comparison table for the three algorithms
function comparisonHTML() {
  // the best algorithm has the smallest total waiting time
  let best = results[0].totalWT;
  for (let i = 1; i < results.length; i++) {
    if (results[i].totalWT < best) {
      best = results[i].totalWT;
    }
  }

  let html = "<div class='card'><h2>Comparison</h2><table>";
  html += "<tr><th>Algorithm</th><th>Average Waiting Time</th><th>Average Turnaround Time</th><th>CPU Utilization</th></tr>";

  for (let i = 0; i < results.length; i++) {
    let r = results[i];
    if (r.totalWT == best) {
      html += "<tr class='best'><td>" + r.name + " <span class='best-label'>Best</span></td>";
    } else {
      html += "<tr><td>" + r.name + "</td>";
    }
    html += "<td>" + r.avgWT.toFixed(2) + " ms</td>";
    html += "<td>" + r.avgTAT.toFixed(2) + " ms</td>";
    html += "<td>" + r.utilization.toFixed(2) + " %</td>";
    html += "</tr>";
  }

  html += "</table><p class='muted'>Best = lowest average waiting time.</p></div>";
  return html;
}

// Redraw the whole page. Called after every change.
function showAll() {
  stopAnimation();
  showProcessTable();

  // highlight the button of the chosen algorithm
  let names = ["FCFS", "SJF", "SRTF", "ALL"];
  for (let i = 0; i < names.length; i++) {
    let button = document.getElementById("btn" + names[i]);
    if (names[i] == algorithm) {
      button.className = "active";
    } else {
      button.className = "";
    }
  }

  if (processes.length == 0) {
    results = [];
    document.getElementById("charts").innerHTML = "<div class='card muted'>Add a process or load an example to see the Gantt chart.</div>";
    document.getElementById("results").innerHTML = "";
    return;
  }

  if (algorithm == "ALL") {
    results = [run("FCFS"), run("SJF"), run("SRTF")];
    showCharts(Infinity);   // Infinity = show all blocks
    document.getElementById("results").innerHTML = comparisonHTML();
  } else {
    results = [run(algorithm)];
    showCharts(Infinity);
    document.getElementById("results").innerHTML = resultsHTML(results[0]);
  }
}


// ---------- 5. Buttons ----------

function nameExists(name) {
  for (let i = 0; i < processes.length; i++) {
    if (processes[i].name == name) {
      return true;
    }
  }
  return false;
}

function addProcess() {
  let name = document.getElementById("name").value.trim();
  let arrivalText = document.getElementById("arrival").value;
  let burstText = document.getElementById("burst").value;
  let arrival = Number(arrivalText);
  let burst = Number(burstText);
  let error = document.getElementById("error");

  // empty name: use the first free name P1, P2, P3 ...
  if (name == "") {
    let number = 1;
    while (nameExists("P" + number)) {
      number = number + 1;
    }
    name = "P" + number;
  }

  // check the input
  let lettersAndNumbers = /^[A-Za-z0-9]+$/;
  if (!lettersAndNumbers.test(name) || name == "IDLE") {
    error.textContent = "Name must use letters and numbers only, and cannot be IDLE.";
    return;
  }
  if (nameExists(name)) {
    error.textContent = "The name " + name + " is already used.";
    return;
  }
  if (arrivalText == "" || !Number.isInteger(arrival) || arrival < 0 || arrival > 999) {
    error.textContent = "Arrival time must be a whole number from 0 to 999.";
    return;
  }
  if (burstText == "" || !Number.isInteger(burst) || burst < 1 || burst > 999) {
    error.textContent = "Burst time must be a whole number from 1 to 999.";
    return;
  }

  error.textContent = "";
  processes.push({ name: name, arrival: arrival, burst: burst });
  document.getElementById("name").value = "";
  showAll();
}

function deleteProcess(index) {
  processes.splice(index, 1);
  showAll();
}

function clearAll() {
  processes = [];
  showAll();
}

function loadExample(number) {
  processes = examples[number].slice();   // slice() makes a copy of the list
  showAll();
}

function chooseAlgorithm(name) {
  algorithm = name;
  showAll();
}

function stopAnimation() {
  clearInterval(timer);
  timer = null;
}

// Show the chart one block at a time
function playAnimation() {
  if (results.length == 0) {
    return;
  }
  stopAnimation();

  // the animation ends when the longest chart is complete
  let mostBlocks = 0;
  for (let i = 0; i < results.length; i++) {
    if (results[i].blocks.length > mostBlocks) {
      mostBlocks = results[i].blocks.length;
    }
  }

  let shown = 0;
  showCharts(0);

  timer = setInterval(function () {
    shown = shown + 1;
    showCharts(shown);
    if (shown >= mostBlocks) {
      stopAnimation();
    }
  }, 700);
}


// ---------- 6. Quick check ----------
// Compares the three textbook examples with their known answers.
// Open the browser console (F12) to see the message.

function checkAnswers() {
  let a = calculate("FCFS", examples[0], fcfs(examples[0])).avgWT;
  let b = calculate("SJF", examples[1], sjf(examples[1])).avgWT;
  let c = calculate("SRTF", examples[2], srtf(examples[2])).avgWT;

  if (a == 17 && b == 7 && c == 6.5) {
    console.log("Check passed: FCFS = 17, SJF = 7, SRTF = 6.5");
  } else {
    console.error("Check FAILED. Got:", a, b, c);
  }
}


// ---------- 7. Start ----------

checkAnswers();
loadExample(2);
