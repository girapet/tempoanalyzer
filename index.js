 
let notesPerBeat = 4;
let notesPerSample = 12;
const coincidentTolerance = 40; // milliseconds

let noteStack = [];

const tempoBpmDisplay = document.getElementById('tempo-bpm');
const tempoStdDevDisplay = document.getElementById('tempo-std-dev');
const tempoMaxDevDisplay = document.getElementById('tempo-max-dev');
 
const velocityAvgDisplay = document.getElementById('velocity-avg');
const velocityStdDevDisplay = document.getElementById('velocity-std-dev');
const velocityMaxDevDisplay = document.getElementById('velocity-max-dev');

const reset = () => {
  tempoBpmDisplay.innerHTML = '&mdash;';
  tempoStdDevDisplay.innerHTML = '&mdash;';
  tempoMaxDevDisplay.innerHTML = '&mdash;';

  velocityAvgDisplay.innerHTML = '&mdash;';
  velocityStdDevDisplay.innerHTML = '&mdash;';
  velocityMaxDevDisplay.innerHTML = '&mdash;';

  noteStack = [];
};

const addOption = (select, value, selected) => {
  const option = document.createElement('option');
  option.value = value;
  option.innerText = value;
  option.selected = selected;
  select.appendChild(option)
};

const notesPerBeatSelect = document.getElementById('notes-per-beat');
[1, 2, 3, 4, 6].forEach((n) => addOption(notesPerBeatSelect, n, n === notesPerBeat));
notesPerBeatSelect.addEventListener('change', () => {
  notesPerBeat = parseInt(notesPerBeatSelect.value, 10);
  reset();
});

const noteOn = (event) => {
  const { timestamp, velocity } = event.detail;

  if (noteStack.length) {
    if (noteStack.at(-1).timestamp < timestamp - 4000) {
      reset();
    }
  }

  if (!noteStack.length) {
    noteStack.push({ timestamp, velocity, count: 1 });
  }
  else {
    const current = noteStack.at(-1);

    if (timestamp - current.timestamp < coincidentTolerance) {
      const count = current.count + 1;
      current.timestamp = (current.timestamp * current.count + timestamp) / count;
      current.velocity = (current.velocity * current.count + velocity) / count;
      current.count = count;
    }
    else {
      noteStack.push({ timestamp, velocity, count: 1 });
    }
  }

  if (noteStack.length < notesPerSample + 1) {
    return;
  }

  const intervals = [];

  for (let i = 1; i < noteStack.length; i++) {
    intervals.push(noteStack[i].timestamp - noteStack[i - 1].timestamp);
  }

  const tempoAverage = intervals.reduce((pv, cv) => pv + cv, 0) / intervals.length;
  const tempoDeviations =  intervals.map((v) => v - tempoAverage);
  const tempoStdDev = Math.sqrt(tempoDeviations.map((v) => v * v).reduce((pv, cv) => pv + cv, 0) / tempoDeviations.length);
  const tempoMaxDev = tempoDeviations.reduce((pv, cv) => Math.abs(cv) > Math.abs(pv) ? cv : pv, 0);

  const velocities = noteStack.map((n) => n.velocity * 100);
  const velocityAverage = velocities.reduce((pv, cv) => pv + cv, 0) / velocities.length;
  const velocityDeviations = velocities.map((v) => v - velocityAverage);
  const velocityStdDev = Math.sqrt(velocityDeviations.map((v) => v * v).reduce((pv, cv) => pv + cv, 0) / velocityDeviations.length);
  const velocityMaxDev = velocityDeviations.reduce((pv, cv) => Math.abs(cv) > Math.abs(pv) ? cv : pv, 0);

  const bpm = (60000 / tempoAverage) / notesPerBeat;

  tempoBpmDisplay.innerText = bpm.toFixed(1);
  tempoStdDevDisplay.innerText = `${tempoStdDev.toFixed(0)}`;
  tempoMaxDevDisplay.innerText = `${tempoMaxDev.toFixed(0)}`;

  velocityAvgDisplay.innerText = `${velocityAverage.toFixed(0)}`;
  velocityStdDevDisplay.innerText = `${velocityStdDev.toFixed(0)}`;
  velocityMaxDevDisplay.innerText = `${velocityMaxDev.toFixed(0)}`;

  for (let i = 0; i < notesPerBeat; i++) {
    noteStack.shift();
  }
};

document.getElementById('midi').addEventListener('noteon', (e) => { noteOn(e) })
