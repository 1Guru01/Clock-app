// Global variables
let alarms = [];
let stopwatchInterval;
let stopwatchTime = 0;
let timerInterval;
let timerTime = 0;
let isStopwatchRunning = false;
let isTimerRunning = false;

// Audio context for ringtones
let audioContext;
let currentAlarmSound;

// Initialize the app
function init() {
  updateClock();
  updateWorldClocks();
  createClockTicks();
  setInterval(updateClock, 1000);
  setInterval(updateWorldClocks, 1000);
  setInterval(checkAlarms, 1000);

  // Initialize audio context
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) {
    console.log("Audio not supported");
  }
}

// Theme toggle
function toggleTheme() {
  const body = document.body;
  const themeToggle = document.querySelector(".theme-toggle");

  if (body.getAttribute("data-theme") === "dark") {
    body.removeAttribute("data-theme");
    themeToggle.innerHTML = "🌙 Dark Mode";
  } else {
    body.setAttribute("data-theme", "dark");
    themeToggle.innerHTML = "☀️ Light Mode";
  }
}

// Tab switching
function switchTab(tabName) {
  // Hide all tab contents
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.remove("active");
  });

  // Remove active class from all tabs
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.remove("active");
  });

  // Show selected tab content
  document.getElementById(tabName).classList.add("active");

  // Add active class to clicked tab
  event.target.classList.add("active");
}

// Clock functions
function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString();
  const date = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  document.getElementById("digitalClock").textContent = time;
  document.getElementById("dateDisplay").textContent = date;

  // Update analog clock with the same time
  updateAnalogClock(now);
}

function updateAnalogClock(now) {
  const hours = now.getHours() % 12;
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  // Calculate angles for each hand (0 degrees = 12 o'clock position)
  const secondAngle = seconds * 6; // 6 degrees per second (360/60)
  const minuteAngle = minutes * 6 + seconds * 0.1; // 6 degrees per minute + smooth seconds
  const hourAngle = hours * 30 + minutes * 0.5; // 30 degrees per hour + smooth minutes

  // Update hand positions
  const secondHand = document.getElementById("secondHand");
  const minuteHand = document.getElementById("minuteHand");
  const hourHand = document.getElementById("hourHand");

  if (secondHand) secondHand.style.transform = `rotate(${secondAngle}deg)`;
  if (minuteHand) minuteHand.style.transform = `rotate(${minuteAngle}deg)`;
  if (hourHand) hourHand.style.transform = `rotate(${hourAngle}deg)`;
}

function createClockTicks() {
  const ticksContainer = document.getElementById("clockTicks");

  // Create hour ticks
  for (let i = 0; i < 12; i++) {
    const tick = document.createElement("div");
    tick.className = "tick tick-hour";
    tick.style.transform = `rotate(${i * 30}deg)`;
    ticksContainer.appendChild(tick);
  }

  // Create minute ticks
  for (let i = 0; i < 60; i++) {
    if (i % 5 !== 0) {
      // Skip positions where hour ticks are
      const tick = document.createElement("div");
      tick.className = "tick tick-minute";
      tick.style.transform = `rotate(${i * 6}deg)`;
      ticksContainer.appendChild(tick);
    }
  }
}

// World clock functions
function updateWorldClocks() {
  const now = new Date();

  // New York (EST/EDT)
  const nyTime = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" })
  );
  document.getElementById("nyTime").textContent = nyTime.toLocaleTimeString();
  document.getElementById("nyDate").textContent = nyTime.toLocaleDateString();

  // London (GMT/BST)
  const londonTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Europe/London" })
  );
  document.getElementById("londonTime").textContent =
    londonTime.toLocaleTimeString();
  document.getElementById("londonDate").textContent =
    londonTime.toLocaleDateString();

  // Tokyo (JST)
  const tokyoTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" })
  );
  document.getElementById("tokyoTime").textContent =
    tokyoTime.toLocaleTimeString();
  document.getElementById("tokyoDate").textContent =
    tokyoTime.toLocaleDateString();

  // Sydney (AEST/AEDT)
  const sydneyTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Australia/Sydney" })
  );
  document.getElementById("sydneyTime").textContent =
    sydneyTime.toLocaleTimeString();
  document.getElementById("sydneyDate").textContent =
    sydneyTime.toLocaleDateString();
}

// Alarm functions
function setAlarm() {
  const hour = parseInt(document.getElementById("alarmHour").value);
  const minute = parseInt(document.getElementById("alarmMinute").value);
  const ringtone = document.getElementById("ringtoneSelect").value;

  if (
    isNaN(hour) ||
    isNaN(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    alert("Please enter valid time values");
    return;
  }

  const alarm = {
    id: Date.now(),
    hour: hour,
    minute: minute,
    ringtone: ringtone,
    enabled: true,
  };

  alarms.push(alarm);
  renderAlarms();
}

function renderAlarms() {
  const alarmList = document.getElementById("alarmList");
  alarmList.innerHTML = "";

  alarms.forEach((alarm) => {
    if (alarm.enabled) {
      const alarmDiv = document.createElement("div");
      alarmDiv.className = "alarm-item";
      alarmDiv.innerHTML = `
                        <div>
                            <div class="alarm-time">${String(
                              alarm.hour
                            ).padStart(2, "0")}:${String(alarm.minute).padStart(
        2,
        "0"
      )}</div>
                            <div style="font-size: 0.9rem; color: var(--text-secondary);">Ringtone: ${
                              alarm.ringtone
                            }</div>
                        </div>
                        <div class="alarm-actions">
                            <button class="btn btn-danger" onclick="deleteAlarm(${
                              alarm.id
                            })" style="padding: 5px 10px; font-size: 14px;">Delete</button>
                        </div>
                    `;
      alarmList.appendChild(alarmDiv);
    }
  });
}

function deleteAlarm(id) {
  alarms = alarms.filter((alarm) => alarm.id !== id);
  renderAlarms();
}

function checkAlarms() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentSecond = now.getSeconds();

  alarms.forEach((alarm) => {
    if (
      alarm.enabled &&
      alarm.hour === currentHour &&
      alarm.minute === currentMinute &&
      currentSecond === 0
    ) {
      triggerAlarm(alarm);
    }
  });
}

function triggerAlarm(alarm) {
  playRingtone(alarm.ringtone);
  document.getElementById("alarmMessage").textContent = `Alarm set for ${String(
    alarm.hour
  ).padStart(2, "0")}:${String(alarm.minute).padStart(2, "0")}`;
  document.getElementById("alarmModal").classList.add("active");
}

function dismissAlarm() {
  document.getElementById("alarmModal").classList.remove("active");
  if (currentAlarmSound) {
    currentAlarmSound.stop();
    currentAlarmSound = null;
  }
}

function playRingtone(type) {
  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  let frequency;
  switch (type) {
    case "beep":
      frequency = 800;
      break;
    case "chime":
      frequency = 1000;
      break;
    case "bell":
      frequency = 1200;
      break;
    case "digital":
      frequency = 600;
      break;
    default:
      frequency = 800;
  }

  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  oscillator.type = "sine";

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + 2
  );

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 2);

  currentAlarmSound = oscillator;
}

// Stopwatch functions
function startStopwatch() {
  if (!isStopwatchRunning) {
    isStopwatchRunning = true;
    stopwatchInterval = setInterval(() => {
      stopwatchTime++;
      updateStopwatchDisplay();
    }, 10);

    document.getElementById("stopwatchStart").disabled = true;
    document.getElementById("stopwatchPause").disabled = false;
  }
}

function pauseStopwatch() {
  if (isStopwatchRunning) {
    isStopwatchRunning = false;
    clearInterval(stopwatchInterval);

    document.getElementById("stopwatchStart").disabled = false;
    document.getElementById("stopwatchPause").disabled = true;
  }
}

function resetStopwatch() {
  isStopwatchRunning = false;
  clearInterval(stopwatchInterval);
  stopwatchTime = 0;
  updateStopwatchDisplay();

  document.getElementById("stopwatchStart").disabled = false;
  document.getElementById("stopwatchPause").disabled = true;
}

function updateStopwatchDisplay() {
  const minutes = Math.floor(stopwatchTime / 6000);
  const seconds = Math.floor((stopwatchTime % 6000) / 100);
  const centiseconds = stopwatchTime % 100;

  const display = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}:${String(centiseconds).padStart(2, "0")}`;
  document.getElementById("stopwatchDisplay").textContent = display;
}

// Timer functions
function startTimer() {
  const hours = parseInt(document.getElementById("timerHour").value) || 0;
  const minutes = parseInt(document.getElementById("timerMinute").value) || 0;
  const seconds = parseInt(document.getElementById("timerSecond").value) || 0;

  if (hours === 0 && minutes === 0 && seconds === 0) {
    alert("Please set a valid timer duration");
    return;
  }

  timerTime = hours * 3600 + minutes * 60 + seconds;

  if (!isTimerRunning) {
    isTimerRunning = true;
    timerInterval = setInterval(() => {
      if (timerTime > 0) {
        timerTime--;
        updateTimerDisplay();

        if (timerTime <= 10) {
          document.getElementById("timerDisplay").classList.add("warning");
        }
      } else {
        // Timer finished
        clearInterval(timerInterval);
        isTimerRunning = false;
        document.getElementById("timerDisplay").classList.remove("warning");
        document.getElementById("timerPause").disabled = true;

        // Trigger timer alarm
        playRingtone("bell");
        alert("Timer finished!");
      }
    }, 1000);

    document.getElementById("timerPause").disabled = false;
  }
}

function pauseTimer() {
  if (isTimerRunning) {
    isTimerRunning = false;
    clearInterval(timerInterval);
    document.getElementById("timerPause").disabled = true;
    document.getElementById("timerDisplay").classList.remove("warning");
  }
}

function resetTimer() {
  isTimerRunning = false;
  clearInterval(timerInterval);
  timerTime = 0;

  const hours = parseInt(document.getElementById("timerHour").value) || 0;
  const minutes = parseInt(document.getElementById("timerMinute").value) || 0;
  const seconds = parseInt(document.getElementById("timerSecond").value) || 0;

  timerTime = hours * 3600 + minutes * 60 + seconds;
  updateTimerDisplay();

  document.getElementById("timerPause").disabled = true;
  document.getElementById("timerDisplay").classList.remove("warning");
}

function updateTimerDisplay() {
  const hours = Math.floor(timerTime / 3600);
  const minutes = Math.floor((timerTime % 3600) / 60);
  const seconds = timerTime % 60;

  const display = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
  document.getElementById("timerDisplay").textContent = display;
}

// Initialize timer display
function initializeTimerDisplay() {
  const hours = parseInt(document.getElementById("timerHour").value) || 0;
  const minutes = parseInt(document.getElementById("timerMinute").value) || 0;
  const seconds = parseInt(document.getElementById("timerSecond").value) || 0;

  timerTime = hours * 3600 + minutes * 60 + seconds;
  updateTimerDisplay();
}

// Event listeners for timer input changes
document
  .getElementById("timerHour")
  .addEventListener("input", initializeTimerDisplay);
document
  .getElementById("timerMinute")
  .addEventListener("input", initializeTimerDisplay);
document
  .getElementById("timerSecond")
  .addEventListener("input", initializeTimerDisplay);

// Initialize the app when page loads
document.addEventListener("DOMContentLoaded", function () {
  init();
  initializeTimerDisplay();
});

// Handle user interaction for audio context
document.addEventListener("click", function () {
  if (audioContext && audioContext.state === "suspended") {
    audioContext.resume();
  }
});
