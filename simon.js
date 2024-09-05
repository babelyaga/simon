// DOM Elements
const colorButtons = document.querySelectorAll(".color-button");
const messageElement = createElement("div", "message");
const levelElement = createElement("div", "level", {
  position: "absolute",
  top: "10px",
  right: "10px",
  textShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)",
  fontSize: "30px",
});
const resetButton = createElement("button", "reset-button");
const blackAndWhiteButton = createElement("button", "black-and-white-button");
const startButton = createElement("button", "start-button");
const repeatButton = createElement("button", "repeat-button");

// Initial Setup
blackAndWhiteButton.textContent = "Black and White";
blackAndWhiteButton.addEventListener("click", blackAndWhite);

startButton.textContent = "Start Game";
startButton.addEventListener("click", startGame);

repeatButton.textContent = "Repeat";
repeatButton.addEventListener("click", repeatSequence);

// Game Configuration
const soundMap = {
  red: "red.mp3",
  green: "green.mp3",
  blue: "blue.mp3",
  yellow: "yellow.mp3",
};

// Add event listener to each button
colorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // Get the button color from the class name or data attribute
    const color = button.getAttribute("data-color");
    // Get the sound file path from the sound map
    const soundFilePath = soundMap[color];
    // Play the sound
    const sound = new Audio(soundFilePath);
    sound.play();
  });
});

const COLORS = ["red", "green", "blue", "yellow"];
const MAX_LEVEL = 100;
const TIMEOUTS = {
  DEFAULT: 550,
  MEDIUM: 350,
  FAST: 250,
  VERY_FAST: 150,
};

// Game State
let gameState = {
  currentLevel: 1,
  sequence: [],
  playerInput: [],
  isGameOver: false,
  repeatUsed: false,
};

// Main Functions
function initializeGame() {
  resetGameState();
  updateUI();
  setupEventListeners();
}

function startGame() {
  if (gameState.sequence.length === 0) {
    generateSequence();
    startButton.disabled = true;
    repeatButton.disabled = false;
    gameState.repeatUsed = false;
  }
}

function playRound(color) {
  if (gameState.isGameOver) return;

  if (isCorrectColor(color)) {
    handleCorrectInput();
  } else {
    handleIncorrectInput();
  }
}

function resetGame() {
  resetGameState();
  updateUI();
  clearMessage();
  generateSequence();
  resetButton.textContent = "Reset Game";
  blackAndWhiteButton.disabled = false;
  repeatButton.disabled = false;
  resetButton.disabled = true;
  gameState.repeatUsed = false;
}

// Helper Functions
function resetGameState() {
  gameState = {
    currentLevel: 1,
    sequence: [],
    playerInput: [],
    isGameOver: false,
    repeatUsed: false,
  };
  colorButtons.forEach((button) => {
    button.disabled = false;
    button.classList.remove("grayed-out");
    button.style.backgroundColor = button.dataset.color;
  });
}

function repeatSequence() {
  // Check if the game is over, the sequence is empty, or the repeat was already used
  if (
    gameState.isGameOver ||
    gameState.sequence.length === 0 ||
    gameState.repeatUsed
  ) {
    repeatButton.disabled = true;
    showMessage("Can't Repeat 😞", "message");
    return;
  }

  // Disable color buttons and reset button while sequence is being displayed
  colorButtons.forEach((button) => (button.disabled = true));
  resetButton.disabled = true;

  // Display the sequence to the player
  displaySequence();

  // Re-enable buttons after the sequence is displayed
  setTimeout(() => {
    colorButtons.forEach((button) => (button.disabled = false));
    resetButton.disabled = false;

    // Do not re-enable the repeat button since it's only allowed once per game
    // No need to reset repeatButton.disabled to false here
  }, gameState.sequence.length * getTimeoutForCurrentLevel() * 2);

  // Mark that the repeat has been used
  gameState.repeatUsed = true;

  // Disable the repeat button permanently for the rest of the game
  repeatButton.disabled = true;
}

function updateUI() {
  updateLevelElement();
  if (gameState.currentLevel === 8) {
    colorButtons.forEach((button) => (button.style.backgroundColor = "gray"));
  }
}

function generateSequence() {
  resetButton.disabled = true;
  gameState.sequence.push(getRandomColor());
  displaySequence();
}

function displaySequence() {
  gameState.sequenceIsRunning = true;
  const timeout = getTimeoutForCurrentLevel();
  gameState.sequence.forEach((color, index) => {
    setTimeout(() => flashButton(color), index * timeout * 2);
  });
  setTimeout(() => {
    setTimeout(() => {
      gameState.sequenceIsRunning = false;
      gameState.playerInput = [];
      clearMessage();
      resetButton.disabled = false;
      colorButtons.forEach((button) => {
        button.disabled = false;
      });
    }, 500);
  }, gameState.sequence.length * timeout * 2);
}

function isCorrectColor(color) {
  return color === gameState.sequence[gameState.playerInput.length];
}

function handleCorrectInput() {
  gameState.playerInput.push(gameState.sequence[gameState.playerInput.length]);
  if (gameState.playerInput.length === gameState.sequence.length) {
    if (gameState.currentLevel < MAX_LEVEL) {
      advanceToNextLevel();
    } else {
      endGame(true);
    }
  }
}

function handleIncorrectInput() {
  showMessage("Incorrect!", "incorrect");
  setTimeout(() => {
    clearMessage("incorrect");
    endGame(false);
  }, 1000);
}

function advanceToNextLevel() {
  showMessage("Correct!", "correct");
  setTimeout(() => {
    clearMessage("correct");
    gameState.currentLevel++;
    updateUI();
    generateSequence();
  }, 1000);
}

function endGame(isWin) {
  gameState.isGameOver = true;
  colorButtons.forEach((button) => {
    button.disabled = true;
    if (!isWin) button.classList.add("grayed-out");
  });
  repeatButton.disabled = true;
  startButton.disabled = true;
  blackAndWhiteButton.disabled = true;
  showMessage(
    isWin ? "Congratulations! You are a robot." : "Game Over!",
    isWin ? "win" : "game-over"
  );
  resetButton.textContent = "Try Again";
}

function blackAndWhite() {
  resetGameState();
  updateUI();
  clearMessage();
  generateSequence();
  colorButtons.forEach((button) => {
    button.style.backgroundColor = "gray";
  });
  blackAndWhiteButton.disabled = true;
  startButton.disabled = true;
}

// Utility Functions
function createElement(tag, className, styles = {}) {
  const element = document.createElement(tag);
  element.classList.add(className);
  Object.assign(element.style, styles);
  document.body.appendChild(element);
  return element;
}

function getRandomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function getTimeoutForCurrentLevel() {
  if (gameState.currentLevel >= 9) return TIMEOUTS.VERY_FAST;
  if (gameState.currentLevel >= 8) return TIMEOUTS.FAST;
  if (gameState.currentLevel >= 5) return TIMEOUTS.MEDIUM;
  return TIMEOUTS.DEFAULT;
}

function updateLevelElement() {
  levelElement.textContent = `Score: ${gameState.currentLevel}`;
}

function showMessage(text, className) {
  messageElement.textContent = text;
  messageElement.classList.add(className);
}

function clearMessage() {
  messageElement.textContent = "";
  messageElement.className = "message";
}

function flashButton(color) {
  const button = document.querySelector(`.color-button[data-color="${color}"]`);
  button.classList.add("active");
  const soundFilePath = soundMap[color];
  const sound = new Audio(soundFilePath);
  sound.play();
  setTimeout(
    () => button.classList.remove("active"),
    getTimeoutForCurrentLevel()
  );
}

function setupEventListeners() {
  colorButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (gameState.sequenceIsRunning) return;
      playRound(button.dataset.color);
    });
  });

  resetButton.textContent = "Reset Game";
  resetButton.addEventListener("click", resetGame);
}

// Initialize Game
initializeGame();
