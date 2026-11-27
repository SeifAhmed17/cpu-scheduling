# CPU Scheduling Visualizer — progress

Marks: `[x]` done and exercised · `[~]` in progress · `[ ]` not started · `[!]` blocked

## 🆕 What changed in this update

2026-11-25 — rewritten in the most basic style, at Seif's request.

- `index.html`, `style.css` and `script.js` were rewritten from scratch: plain functions, `for` loops, `if/else`, string concatenation, `onclick` attributes, a comment on every step. One function per algorithm (`fcfs`, `sjf`, `srtf`).
- Dropped to keep the code simple: Pause, Step +1 and Show full chart buttons; the "time / running / waiting" status line; dimming of unfinished rows; per-process waiting times in the comparison table.
- Changed: the animation now shows one Gantt block per step (700 ms each) instead of one millisecond per step. Each block shows its own start and end time underneath.
- New limits: names are letters and numbers only, arrival 0–999, burst 1–999.
- Logic and UI were re-tested on the new files in headless Edge and passed.
- Still not done by a human: a click-through in a normal browser window.

Earlier the same day: first build as one file, then split into three files.

## Spec checklist

### 1. Process input and management
- [x] Add: name, arrival time (integer ≥ 0), burst time (integer ≥ 1)
  - [x] Rejects burst 0, negative arrival, decimals, empty values, values above 999
  - [x] Rejects duplicate names, names with symbols, and the name `IDLE`
  - [x] Blank name uses the first free `P<n>`
- [x] Process table with per-row delete
- [x] Clear all
- [x] Example buttons: FCFS, SJF, SRTF, idle time

### 2. Algorithms
- [x] FCFS — order of arrival, ties by input order
- [x] SJF non-preemptive — shortest burst among arrived, ties by arrival then input order
- [x] SRTF — re-decides every 1 ms, preempts only on a strictly shorter remaining time
- [x] Compare all — three Gantt charts plus a comparison table, best row (lowest average waiting time) highlighted; ties highlight every tied row

### 3. Formulas
- [x] CT, TAT = CT − AT, WT = TAT − BT
- [x] Average WT, average TAT
- [x] CPU idle time when nothing has arrived (leading gaps and gaps mid-schedule)
- [x] CPU utilization = busy time ÷ total time, counted from t = 0

### 4. Visual output
- [x] Gantt chart: colour per process, start and end time under every block, grey IDLE blocks
- [x] Play step by step: one block per step, newest block fades in
- [x] Results table: process, arrival, burst, completion, turnaround, waiting
- [x] KPI cards: average waiting time, average turnaround time, CPU utilization

### 5. UI and technical constraints
- [x] Three local files (`index.html`, `style.css`, `script.js`), zero external requests — single-file constraint dropped on request
- [x] Dark dashboard look; one column under 850 px (checked at 500 px)
- [x] Edge cases: out-of-order arrival, simultaneous arrivals, idle gaps
- [ ] Manual pass in a real browser window

## How it was verified

- `checkAnswers()` at the bottom of `script.js` runs on every page load and compares the three textbook examples with their known answers (FCFS 17, SJF 7, SRTF 6.5). The message appears in the browser console (F12).
- Scripted run in headless Edge: 11 schedules checked block by block (including idle gaps, ties and out-of-order input), then add, ten kinds of invalid input, delete, each algorithm, compare, a tie, play to the end, clear. All passed.
- Screenshots reviewed: single algorithm, compare mode mid-animation, 500 px wide.

## Deferred (not in the spec, add on request)

- Pause / step / speed controls for the animation.
- Saving the process list between visits.
- More algorithms (Round Robin, priority) and response time.

## Recommended next step

Open `index.html` in a browser and click through it once.
