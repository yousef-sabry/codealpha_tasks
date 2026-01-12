// DOM Elements
const display = document.getElementById("display");
const buttons = document.querySelectorAll(".btn");
const themeToggle = document.getElementById("theme-toggle");
const historyList = document.getElementById("history-list");
const historyPanel = document.getElementById("history-panel");

// State Variables
let currentInput = "";
let previousInput = "";
let operation = null;
let history = [];
let isDarkMode = false;
let memory = 0;

// Load memory from localStorage
const storedMemory = localStorage.getItem("calc-memory");
if (storedMemory !== null && !isNaN(parseFloat(storedMemory))) {
  memory = parseFloat(storedMemory);
}

// Theme Toggle
themeToggle.addEventListener("click", () => {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle("dark", isDarkMode);
  themeToggle.textContent = isDarkMode ? "☀️" : "🌙";
});

// Button Click Handler
buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const value = button.getAttribute("data-value");
    // Ignore buttons without a data-value (e.g., the Clear History button)
    if (value == null) return;
    handleInput(value);
  });
});

// Keyboard Support
document.addEventListener("keydown", (e) => {
  // Memory shortcuts using the 'm' key:
  if (e.key && e.key.toLowerCase() === "m") {
    if (e.ctrlKey || e.metaKey) {
      memoryAdd();
      highlightButton("M+");
      e.preventDefault();
      return;
    }
    if (e.altKey) {
      memorySubtract();
      highlightButton("M-");
      e.preventDefault();
      return;
    }
    if (e.shiftKey) {
      memoryClear();
      highlightButton("MC");
      e.preventDefault();
      return;
    }
    // plain 'm' -> recall
    memoryRecall();
    highlightButton("MR");
    e.preventDefault();
    return;
  }

  const mapped = mapKeyToValue(e);
  if (mapped) {
    // prevent default for Enter to avoid unintended behavior
    if (e.key === "Enter" || e.code === "NumpadEnter") e.preventDefault();
    handleInput(mapped);
    highlightButton(mapped);
  }
});

// Map physical keys to calculator values (supports Numpad and main keyboard)
function mapKeyToValue(e) {
  const key = e.key;
  const code = e.code;
  if (key >= "0" && key <= "9") return key;
  if (key === "." || code === "NumpadDecimal" || key === "Decimal") return ".";
  if (key === "+" || code === "NumpadAdd") return "+";
  if (key === "-" || code === "NumpadSubtract") return "-";
  if (key === "*" || code === "NumpadMultiply") return "*";
  if (key === "/" || code === "NumpadDivide") return "/";
  if (key === "=" || key === "Enter" || code === "NumpadEnter") return "=";
  if (key === "Backspace" || key === "Delete") return "backspace";
  if (key === "Escape" || key === "c" || key === "C") return "AC";
  return null;
}

// Visual feedback for keyboard presses — highlight the corresponding button briefly
function highlightButton(value) {
  let btn = null;
  if (value === "backspace") {
    btn = document.querySelector(".clear");
  } else {
    try {
      btn = document.querySelector(`.btn[data-value="${value}"]`);
    } catch (err) {
      // Fallback for special characters
      const all = document.querySelectorAll(".btn");
      for (let b of all) {
        if (b.getAttribute("data-value") === value) {
          btn = b;
          break;
        }
      }
    }
  }
  if (!btn) return;
  btn.classList.add("active");
  setTimeout(() => btn.classList.remove("active"), 150);
}

// Memory functions and persistence
function saveMemory() {
  localStorage.setItem("calc-memory", memory.toString());
  updateMemoryIndicator();
}

function updateMemoryIndicator() {
  const ind = document.getElementById("memory-indicator");
  if (!ind) return;
  if (!isNaN(memory) && memory !== 0) {
    ind.hidden = false;
    ind.textContent = "M";
    ind.title = `Memory: ${memory}`;
  } else {
    ind.hidden = true;
    ind.textContent = "";
    ind.removeAttribute("title");
  }
}

// Memory operations: M+, M-, MR, MC
function memoryAdd() {
  const val = parseFloat(currentInput || display.textContent);
  if (isNaN(val)) return;
  memory += val;
  saveMemory();
  addToHistory(`M+ ${val} → memory=${memory}`);
}

function memorySubtract() {
  const val = parseFloat(currentInput || display.textContent);
  if (isNaN(val)) return;
  memory -= val;
  saveMemory();
  addToHistory(`M- ${val} → memory=${memory}`);
}

function memoryRecall() {
  currentInput = memory.toString();
  updateDisplay(currentInput);
  addToHistory(`MR → ${memory}`);
}

function memoryClear() {
  memory = 0;
  saveMemory();
  addToHistory(`MC → cleared`);
}

// show memory indicator on load
updateMemoryIndicator();

// Input Handler
function handleInput(value) {
  if (value === "AC") {
    currentInput = "";
    previousInput = "";
    operation = null;
    updateDisplay("0");
  } else if (value === "backspace") {
    currentInput = currentInput.slice(0, -1);
    updateDisplay(currentInput || "0");
  } else if (value === "M+") {
    memoryAdd();
  } else if (value === "M-") {
    memorySubtract();
  } else if (value === "MR") {
    memoryRecall();
  } else if (value === "MC") {
    memoryClear();
  } else if (["+", "-", "*", "/"].includes(value)) {
    if (currentInput) {
      if (previousInput && operation) {
        calculate();
      }
      previousInput = currentInput;
      operation = value;
      currentInput = "";
    }
  } else if (value === "=") {
    if (previousInput && currentInput && operation) {
      calculate();
    }
  } else {
    if (value === "." && currentInput.includes(".")) return;
    currentInput += value;
    updateDisplay(currentInput);
  }
}

// Calculate Function
function calculate() {
  let result;
  const prev = parseFloat(previousInput);
  const curr = parseFloat(currentInput);
  switch (operation) {
    case "+":
      result = prev + curr;
      break;
    case "-":
      result = prev - curr;
      break;
    case "*":
      result = prev * curr;
      break;
    case "/":
      result = curr !== 0 ? prev / curr : "Error";
      break;
  }
  if (result !== "Error") {
    addToHistory(`${previousInput} ${operation} ${currentInput} = ${result}`);
  }
  updateDisplay(result.toString());
  currentInput = result.toString();
  previousInput = "";
  operation = null;
}

// Update Display with Animation
function updateDisplay(value) {
  display.textContent = value;
  display.style.animation = "none";
  setTimeout(() => (display.style.animation = "slideIn 0.3s ease-out"), 10);
}

// History Management
function addToHistory(entry) {
  history.unshift(entry);
  if (history.length > 5) history.pop();
  renderHistory();
  try {
    localStorage.setItem("calc-history", JSON.stringify(history));
  } catch (e) {
    // ignore storage errors
  }
}

function renderHistory() {
  historyList.innerHTML = "";
  if (history.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No history";
    li.style.opacity = "0.7";
    historyList.appendChild(li);
    return;
  }
  history.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    historyList.appendChild(li);
  });
}

// Clear history
function clearHistory() {
  history = [];
  localStorage.removeItem("calc-history");
  renderHistory();
}

// Load persisted history if any
const storedHistory = localStorage.getItem("calc-history");
if (storedHistory) {
  try {
    history = JSON.parse(storedHistory);
  } catch (e) {
    history = [];
  }
  renderHistory();
}

// Wire clear history button
const clearBtn = document.getElementById("clear-history");
if (clearBtn) {
  clearBtn.addEventListener("click", clearHistory);
}

// Responsive History Toggle (for mobile)
if (window.innerWidth <= 480) {
  const toggleBtn = document.createElement("button");
  toggleBtn.textContent = "History";
  toggleBtn.className = "btn";
  toggleBtn.style.gridColumn = "span 4";
  toggleBtn.addEventListener("click", () => {
    historyPanel.classList.toggle("open");
  });
  document.querySelector(".buttons").appendChild(toggleBtn);
}

// Wire header history toggle (visible on mobile)
const headerHistoryToggle = document.getElementById('history-toggle');
if (headerHistoryToggle) {
  headerHistoryToggle.addEventListener('click', () => {
    historyPanel.classList.toggle('open');
    const pressed = headerHistoryToggle.getAttribute('aria-pressed') === 'true';
    headerHistoryToggle.setAttribute('aria-pressed', pressed ? 'false' : 'true');
  });
}

// Compact mode toggle: apply compact layout and persist choice
const compactToggleBtn = document.getElementById("compact-toggle");
const calculatorEl = document.querySelector(".calculator");

function setCompact(enabled, persist = true) {
  if (!calculatorEl) return;
  calculatorEl.classList.toggle("compact", enabled);
  if (compactToggleBtn) {
    compactToggleBtn.setAttribute("aria-pressed", enabled ? "true" : "false");
    compactToggleBtn.title = enabled ? "Compact Mode: On" : "Compact Mode: Off";
  }
  if (persist) {
    try {
      localStorage.setItem("calc-compact", enabled ? "1" : "0");
    } catch (e) {}
  }
}

if (compactToggleBtn) {
  compactToggleBtn.addEventListener("click", () => {
    const isOn = compactToggleBtn.getAttribute("aria-pressed") === "true";
    setCompact(!isOn);
  });
}

// Initialize compact mode from localStorage
try {
  const pref = localStorage.getItem("calc-compact");
  if (pref === "1") setCompact(true, false);
  else setCompact(false, false);
} catch (e) {
  // ignore
}
