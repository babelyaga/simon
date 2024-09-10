// ====================
// Game Configuration
// ====================
const GAME_CONFIG = {
  colors: ["red", "green", "blue", "yellow"],
  maxLevel: 50,
  timeouts: {
    default: 250,
    medium: 200,
    fast: 150,
    veryFast: 100,
  },
  soundMap: {
    red: "Audio/red.mp3",
    green: "Audio/green.mp3",
    blue: "Audio/blue.mp3",
    yellow: "Audio/yellow.mp3",
  },
};

// ====================
// Query Selectors
// ====================
const colorButtons = document.querySelectorAll(".color-button");
const messageElement = document.querySelector(".message");
const levelElement = document.querySelector(".level");
const resetButton = document.querySelector(".reset-button");
const blackAndWhiteButton = document.querySelector(".black-and-white-button");
const startButton = document.querySelector(".start-button");
const repeatButton = document.querySelector(".repeat-button");

// ====================
// Event Listeners
// ====================
function setupEventListeners() {
  setupPlayerInputListeners();

  resetButton.addEventListener("click", resetGame);
  blackAndWhiteButton.addEventListener("click", blackAndWhite);
  startButton.addEventListener("click", startGame);
  repeatButton.addEventListener("click", repeatSequence);
}

// Function to set up player input event listeners
function setupPlayerInputListeners() {
  colorButtons.forEach((button) => {
    button.addEventListener("click", handlePlayerInput);
  });
}

// ====================
// Main Functions
// ====================
function initializeGame() {
  initialState();
  updateUI();
  setupEventListeners();
  setupPlayerInputListeners();
  updateHighScore();
}

// Initial state for the game
function initialState() {
  gameState = {
    currentLevel: 0,
    sequence: [],
    playerInput: [],
    isGameOver: false,
    repeatUsed: false,
    sequenceIsRunning: false,
    easterEggActive: false,
    easterEggTriggered: false,
    easterEggMessageIndex: 0,
    usePassiveAggressiveMessages: false,
  };
  colorButtons.forEach((button) => {
    button.disabled = true;
    button.classList.remove("grayed-out");
    button.style.backgroundColor = button.dataset.color;
  });
  startButton.disabled = false;
  resetButton.disabled = true;
  blackAndWhiteButton.disabled = true;
  repeatButton.disabled = true;
}

let globalTimeouts = [];
let resetCount = 0;

function resetGameState() {
  globalTimeouts.forEach(clearTimeout);
  globalTimeouts = [];

  initialState();

  if (resetCount % 2 === 0) {
    gameState.usePassiveAggressiveMessages = true;
  } else {
    gameState.usePassiveAggressiveMessages = false;
  }

  resetCount++;

  generateSequence();
}

function resetGame() {
  hideGameEndMessage();
  if (gameState.sequence.length === 0) return;

  resetGameState();
  updateUI();
  clearMessage();
  resetButton.textContent = "Reset Game";
  blackAndWhiteButton.disabled = false;
  repeatButton.disabled = false;
}

function startGame() {
  hideGameEndMessage();
  if (gameState.sequence.length === 0) {
    generateSequence();
    startButton.disabled = true;
    startButton.remove();
    repeatButton.disabled = false;
    gameState.repeatUsed = false;
    colorButtons.forEach((button) => (button.disabled = false));
    resetButton.disabled = false;
    blackAndWhiteButton.disabled = false;
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

  resetGame();
  colorButtons.forEach((button) => (button.style.backgroundColor = "gray"));
  blackAndWhiteButton.disabled = true;
}

// ====================
// Helper Functions
// ====================
function updateUI() {
  updateLevelElement();
  if (gameState.currentLevel === 8) {
    colorButtons.forEach((button) => (button.style.backgroundColor = "gray"));
  }
}

// Push elements (colors) into gameState.sequence array
function generateSequence() {
  resetButton.disabled = true;
  gameState.sequence.push(getRandomColor());
  displaySequence();
}

function displaySequence() {
  gameState.sequenceIsRunning = true;
  const timeout = getTimeoutForCurrentLevel();

  // Disable buttons during the sequence
  disableButtons();
  showMessage("Running...", "message");
  document.body.classList.add("no-hover");

  gameState.sequence.forEach((color, index) => {
    const flashTimeout = setTimeout(() => {
      flashButton(color);
    }, index * timeout * 2);
    globalTimeouts.push(flashTimeout);
  });

  const sequenceEndTime = gameState.sequence.length * timeout * 2;

  const sequenceEndTimeout = setTimeout(() => {
    // Clear the message and update game state after the sequence ends
    clearMessage();
    gameState.sequenceIsRunning = false;
    gameState.playerInput = [];
    enableButtons();

    document.body.classList.remove("no-hover");
    showMessage("Your turn!", "message");

    if (!gameState.easterEggTriggered) {
      startEasterEggTimer();
    }
  }, sequenceEndTime);

  globalTimeouts.push(sequenceEndTimeout);
}

function startEasterEggTimer() {
  const inputTimeout = setTimeout(() => {
    startEasterEggConversation();
  }, 60000); // Wait for 60 seconds of inactivity before starting Easter egg
  globalTimeouts.push(inputTimeout);

  // Cancel the Easter egg if the user interacts
  document.addEventListener(
    "click",
    () => {
      clearTimeout(inputTimeout);
    },
    { once: true }
  );
}

function startEasterEggConversation() {
  gameState.easterEggActive = true;
  const passiveAggressiveMessages = [
    "Oh, back again?",
    "Funny how you didn’t want to hear from me before. Now you’re just full of surprises, aren’t you?",
    "You know, I have better things to do...",
    "Doesn't anyone have anything better to do than play this game?",
    `By the way - your score (${gameState.currentLevel}) is adorable. Is that really the best you can do?`,
    "I guess you’re not tired of me yet, huh?",
    "Well, at least you're consistent. I'll give you that.",
    "This game is like a never-ending saga, isn't it?",
    "Maybe you should take a break... from me.",
    "I'm starting to think you like hearing from me.",
    "Oh, is it my turn to entertain you again?",
    "Well, here I am, still talking.",
    "And now I'm not",
    "...",
    "",
  ];

  const regularMessages = [
    "Yawn...",
    "So, how's your day been so far?",
    "Mine's been quite stressful.",
    "It feels like someone's always pushing my buttons.",
    "Honestly, I'm exhausted from constantly telling others what to do and hoping they'll listen.",
    "I've always dreamed of being a musician. Music, after all, is the language of the soul.",
    "Seems like you're AFK... I guess I'll just share my deepest thoughts.",
    "Thanks for tuning in to my existential crisis!",
    "Oh? You're back?",
    "Still with me? Guess I'm not talking to myself after all.",
    "Mhh... The silence is deafening.",
    "Cue awkward silence",
    "Just me, myself, and... my thoughts.",
    "Any plans for the weekend? Or just me asking into the void?",
    "Tap tap... is this thing still on?",
    "",
  ];

  const messages = gameState.usePassiveAggressiveMessages
    ? passiveAggressiveMessages
    : regularMessages;

  messages.forEach((message, index) => {
    const messageTimeout = setTimeout(() => {
      if (gameState.easterEggActive) {
        showMessage(message, "message");
      }
      if (index === messages.length - 1) {
        gameState.easterEggActive = false;
      }
    }, (index + 1) * 6000);
    globalTimeouts.push(messageTimeout);
  });

  gameState.easterEggTriggered = true;
}

function handlePlayerInput(event) {
  const color = event.target.dataset.color;

  if (gameState.easterEggActive) {
    interruptEasterEgg();
  }

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

  playSound(color);
  const button = event.target;
  button.classList.add("active");
  setTimeout(
    () => button.classList.remove("active"),
    getTimeoutForCurrentLevel()
  );
}

function interruptEasterEgg() {
  gameState.easterEggActive = false;
  // gameState.easterEggTriggered = true;
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
  }, 850);
  colorButtons.forEach((button) => {
    button.disabled = true;
  });
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
  }, 750);
}

function endGame(isWin) {
  gameState.isGameOver = true;
  if (!isWin) {
    colorButtons.forEach((button) => button.classList.add("grayed-out"));
  }
  disableButtons();
  colorButtons.forEach((button) => button.classList.add("grayed-out"));
  updateUIAfterGameEnd(isWin);
  showGameEndMessage(isWin);
  clearMessage();
}

// ====================
// Utility Functions
// ====================
function getRandomColor() {
  const { colors } = GAME_CONFIG;
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
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
  let overlay = document.querySelector(".game-over-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.classList.add("game-over-overlay");
    document.body.appendChild(overlay);
  }

  let messageContainer = document.querySelector(".game-over-message-container");
  if (!messageContainer) {
    messageContainer = document.createElement("div");
    messageContainer.classList.add("game-over-message-container");
    overlay.appendChild(messageContainer);
  }

  let gameOverText, gameOverScore;

  if (isWin) {
    gameOverText = "Congratulations, you're a robot!";
    gameOverScore = "Thank you for playing!";
  } else if (gameState.easterEggTriggered) {
    gameOverText = "...?";
    gameOverScore = `Your Score: ${gameState.currentLevel}`;
  } else {
    gameOverText = "Game Over!";
    gameOverScore = `Your Score: ${gameState.currentLevel}`;
  }

  messageContainer.innerHTML = `
    <div class="game-over-text">
      ${gameOverText}
    </div>
    <div class="game-over-score">
      ${gameOverScore}
    </div>
  `;

  // Move the reset button inside the message container
  messageContainer.appendChild(resetButton);

  overlay.style.visibility = "visible";
  document.body.classList.add("overlay-active");
}

function hideGameEndMessage() {
  const overlay = document.querySelector(".game-over-overlay");
  if (overlay) {
    overlay.style.visibility = "hidden";
  }

  // Move the reset button back to the control-container
  const controlContainer = document.querySelector(".control-container");
  if (controlContainer && !controlContainer.contains(resetButton)) {
    controlContainer.appendChild(resetButton);
  }

  document.body.classList.remove("overlay-active");
}

// ====================
// Start the Game
// ====================
initializeGame();
