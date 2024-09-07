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
  updateLeaderboard();
  colorButtons.forEach((button) => (button.disabled = true));
}

function startGame() {
  let nickname = sessionStorage.getItem("nickname") || promptForNickname();
  if (!nickname) return;

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

  // Add the class to disable hover effects
  document.body.classList.add("no-hover");

  disableButtons(); // Disable buttons while the sequence is running
  showMessage("Running...", "message");

  gameState.sequence.forEach((color, index) => {
    setTimeout(() => flashButton(color), index * timeout * 2);
  });

  const sequenceEndTime = gameState.sequence.length * timeout * 2;

  setTimeout(() => {
    gameState.sequenceIsRunning = false;
    gameState.playerInput = [];
    clearMessage();
    enableButtons(); // Re-enable buttons after the sequence
    showMessage("Your turn!", "message");

    // Remove the class to re-enable hover effects
    document.body.classList.remove("no-hover");
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
  setTimeout(() => {
    clearMessage("correct");
    gameState.currentLevel++;
    updateUI();
    generateSequence();
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
  colorButtons.forEach((button) => (button.disabled = false));
  resetButton.disabled = false;
  blackAndWhiteButton.disabled = false;
  repeatButton.disabled = gameState.repeatUsed;
}

function promptForNickname() {
  const nickname = prompt("Enter your nickname (max 10 characters):");
  if (nickname) {
    const trimmedNickname = nickname.trim().substring(0, 10);
    sessionStorage.setItem("nickname", trimmedNickname);
    return trimmedNickname;
  }
  return null;
}

function updateUIAfterGameEnd(isWin) {
  resetButton.textContent = "Try Again";
  resetButton.disabled = false;
  updateLeaderboard();
}

function showGameEndMessage(isWin) {
  showMessage(
    isWin ? "Congratulations, you're a robot!" : "Game Over!",
    isWin ? "win" : "game-over"
  );
}

function updateLeaderboard() {
  const leaderboardDiv = document.getElementById("leaderboard");
  if (!leaderboardDiv) return;

  let storedScores = JSON.parse(localStorage.getItem("scores")) || [];
  let storedNicknames = JSON.parse(localStorage.getItem("nicknames")) || {};

  storedScores = filterValidScores(storedScores);

  if (gameState.isGameOver) {
    addNewScore(storedScores, storedNicknames);
  }

  // Sort scores by level only
  storedScores.sort((a, b) => b.level - a.level);
  storedScores = storedScores.slice(0, 5);

  localStorage.setItem("scores", JSON.stringify(storedScores));
  localStorage.setItem("nicknames", JSON.stringify(storedNicknames));

  displayLeaderboard(leaderboardDiv, storedScores);
}

function filterValidScores(scores) {
  return scores.filter(
    (score) =>
      typeof score.level === "number" && !isNaN(score.level) && score.nickname // Remove date validation
  );
}

function addNewScore(scores, nicknames) {
  const nickname = sessionStorage.getItem("nickname");
  nicknames[gameState.currentLevel] = nickname;
  scores.push({
    level: gameState.currentLevel,
    nickname: nickname,
  });
}

function displayLeaderboard(leaderboardDiv, scores) {
  leaderboardDiv.innerHTML = "";
  const leaderboardList = document.createElement("ul");

  scores.forEach((score, index) => {
    const listItem = document.createElement("li");
    listItem.textContent = `${index + 1}: Score ${score.level} (${
      score.nickname
    })`;
    leaderboardList.appendChild(listItem);
  });

  leaderboardDiv.appendChild(leaderboardList);
}

// Initialize Game
initializeGame();
