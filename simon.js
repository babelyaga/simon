// Game Configuration
const GAME_CONFIG = {
  colors: ["red", "green", "blue", "yellow"],
  maxLevel: 50,
  timeouts: {
    default: 350,
    medium: 250,
    fast: 200,
    veryFast: 150,
  },
  soundMap: {
    red: "red.mp3",
    green: "green.mp3",
    blue: "blue.mp3",
    yellow: "yellow.mp3",
  },
};

// Game State
let gameState = {
  currentLevel: 0,
  sequence: [],
  playerInput: [],
  isGameOver: false,
  repeatUsed: false,
  sequenceIsRunning: false,
};

// Select the buttons from the HTML
const colorButtons = document.querySelectorAll(".color-button");
const messageElement = document.querySelector(".message");
const levelElement = document.querySelector(".level");
const resetButton = document.querySelector(".reset-button");
const blackAndWhiteButton = document.querySelector(".black-and-white-button");
const startButton = document.querySelector(".start-button");
const repeatButton = document.querySelector(".repeat-button");

// Event Listeners
function setupEventListeners() {
  colorButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (!gameState.sequenceIsRunning) playRound(button.dataset.color);
      playSound(button.dataset.color);
      button.classList.add("active");
      setTimeout(
        () => button.classList.remove("active"),
        getTimeoutForCurrentLevel()
      );
    });
  });

  resetButton.addEventListener("click", resetGame);
  blackAndWhiteButton.addEventListener("click", blackAndWhite);
  startButton.addEventListener("click", startGame);
  repeatButton.addEventListener("click", repeatSequence);
}

// Main Functions
function initializeGame() {
  resetGameState();
  updateUI();
  setupEventListeners();
  updateHighScore();
  colorButtons.forEach((button) => (button.disabled = true));
}

function startGame() {
  hideGameEndMessage(); // Hide the overlay when starting the game
  if (gameState.sequence.length === 0) {
    generateSequence();
    startButton.disabled = true;
    repeatButton.disabled = false;
    gameState.repeatUsed = false;
    startButton.remove();
  }
}

function playRound(color) {
  if (
    gameState.isGameOver ||
    gameState.sequenceIsRunning ||
    gameState.playerInput.length >= gameState.sequence.length
  ) {
    return;
  }

  if (isCorrectColor(color)) {
    handleCorrectInput();
  } else {
    handleIncorrectInput();
  }
}

function resetGame() {
  hideGameEndMessage(); // Hide the overlay when resetting the game
  if (gameState.sequence.length === 0) return;

  resetGameState();
  updateUI();
  clearMessage();
  generateSequence();
  resetButton.textContent = "Reset Game";
  blackAndWhiteButton.disabled = false;
  repeatButton.disabled = false;
  gameState.repeatUsed = false;
  startButton.remove();
}

function repeatSequence() {
  if (
    gameState.isGameOver ||
    gameState.sequence.length === 0 ||
    gameState.repeatUsed
  ) {
    repeatButton.disabled = true;
    return;
  }

  disableButtons();
  displaySequence();
  setTimeout(
    enableButtons,
    gameState.sequence.length * getTimeoutForCurrentLevel() * 2
  );
  gameState.repeatUsed = true;
  repeatButton.disabled = true;
}

function blackAndWhite() {
  if (gameState.sequenceIsRunning) return;

  resetGameState();
  updateUI();
  clearMessage();
  generateSequence();
  colorButtons.forEach((button) => (button.style.backgroundColor = "gray"));
  blackAndWhiteButton.disabled = true;
  startButton.remove();
  gameState.repeatUsed = false;
  repeatButton.disabled = false;
}

// Helper Functions
function resetGameState() {
  gameState = {
    currentLevel: 0,
    sequence: [],
    playerInput: [],
    isGameOver: false,
    repeatUsed: false,
    sequenceIsRunning: false,
  };
  colorButtons.forEach((button) => {
    button.disabled = false;
    button.classList.remove("grayed-out");
    button.style.backgroundColor = button.dataset.color;
  });
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

  document.body.classList.add("no-hover");

  disableButtons();
  showMessage("Running...", "message");

  gameState.sequence.forEach((color, index) => {
    setTimeout(() => flashButton(color), index * timeout * 2);
  });

  const sequenceEndTime = gameState.sequence.length * timeout * 2;

  setTimeout(() => {
    clearMessage();
    gameState.sequenceIsRunning = false;
    gameState.playerInput = [];
    enableButtons();
    document.body.classList.remove("no-hover");
    showMessage("Your turn!", "message");
  }, sequenceEndTime);
}

function isCorrectColor(color) {
  return color === gameState.sequence[gameState.playerInput.length];
}

function handleCorrectInput() {
  gameState.playerInput.push(gameState.sequence[gameState.playerInput.length]);

  if (gameState.playerInput.length === gameState.sequence.length) {
    if (gameState.currentLevel < GAME_CONFIG.maxLevel) {
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
  disableButtons();
  setTimeout(() => {
    clearMessage("correct");
    gameState.currentLevel++;
    updateUI();
    generateSequence();
    enableButtons();
  }, 1000);
}

function endGame(isWin) {
  gameState.isGameOver = true;
  if (!isWin) {
    colorButtons.forEach((button) => button.classList.add("grayed-out"));
  }
  disableButtons();
  updateUIAfterGameEnd(isWin);
  showGameEndMessage(isWin);
}

// Utility Functions
function createElement(tag, className, text = "") {
  const element = document.createElement(tag);
  element.classList.add(className);
  element.textContent = text;
  document.body.appendChild(element);
  return element;
}

function getRandomColor() {
  return GAME_CONFIG.colors[
    Math.floor(Math.random() * GAME_CONFIG.colors.length)
  ];
}

function getTimeoutForCurrentLevel() {
  if (gameState.currentLevel >= 9) return GAME_CONFIG.timeouts.veryFast;
  if (gameState.currentLevel >= 8) return GAME_CONFIG.timeouts.fast;
  if (gameState.currentLevel >= 5) return GAME_CONFIG.timeouts.medium;
  return GAME_CONFIG.timeouts.default;
}

function updateLevelElement() {
  levelElement.textContent = ` ${gameState.currentLevel}`;
}

function showMessage(text, className) {
  messageElement.textContent = text;
  messageElement.className = `message ${className}`;
}

function clearMessage() {
  messageElement.textContent = "";
  messageElement.className = "message";
}

function playSound(color) {
  const sound = new Audio(GAME_CONFIG.soundMap[color]);
  sound.play();
}

function flashButton(color) {
  const button = document.querySelector(`.color-button[data-color="${color}"]`);
  button.classList.add("active");
  playSound(color);
  setTimeout(
    () => button.classList.remove("active"),
    getTimeoutForCurrentLevel()
  );
}

function disableButtons() {
  colorButtons.forEach((button) => (button.disabled = true));
  resetButton.disabled = true;
  blackAndWhiteButton.disabled = true;
  repeatButton.disabled = true;
}

function enableButtons() {
  if (!gameState.sequenceIsRunning) {
    colorButtons.forEach((button) => (button.disabled = false));
    resetButton.disabled = false;
    blackAndWhiteButton.disabled = false;
    repeatButton.disabled = gameState.repeatUsed;
  }
}

function updateHighScore() {
  const highScore = localStorage.getItem("highScore");
  const currentScore = gameState.currentLevel;
  if (!highScore || currentScore > parseInt(highScore, 10)) {
    localStorage.setItem("highScore", currentScore);
  }

  const highScoreElement = document.getElementById("high-score");
  if (highScoreElement) {
    highScoreElement.textContent = `High Score: ${
      localStorage.getItem("highScore") || 0
    }`;
  }
}

function updateUIAfterGameEnd(isWin) {
  resetButton.textContent = "Try Again";
  resetButton.disabled = false;
  updateHighScore();
}

function showGameEndMessage(isWin) {
  // Create or select the overlay element
  let overlay = document.querySelector(".game-over-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.classList.add("game-over-overlay");
    document.body.appendChild(overlay);
  }

  // Create or select the message container
  let messageContainer = document.querySelector(".game-over-message-container");
  if (!messageContainer) {
    messageContainer = document.createElement("div");
    messageContainer.classList.add("game-over-message-container");
    overlay.appendChild(messageContainer);
  }

  // Set the message and score
  messageContainer.innerHTML = `
    <div class="game-over-text">${
      isWin ? "Congratulations, you're a robot!" : "Game Over!"
    }</div>
    <div class="game-over-score">Your Score: ${gameState.currentLevel}</div>
  `;

  // Show the overlay and hide other controls
  overlay.style.visibility = "visible";
  document.body.classList.add("overlay-active");
}

function hideGameEndMessage() {
  const overlay = document.querySelector(".game-over-overlay");
  if (overlay) {
    overlay.style.visibility = "hidden";
  }

  // Show all controls when overlay is hidden
  document.body.classList.remove("overlay-active");
}

// Initialize Game
initializeGame();
