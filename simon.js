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

colorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const color = button.getAttribute("data-color");
    const soundFilePath = soundMap[color];
    const sound = new Audio(soundFilePath);
    sound.play();
  });
});

const COLORS = ["red", "green", "blue", "yellow"];
const MAX_LEVEL = 50;
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
  updateLeaderboard();

  colorButtons.forEach((button) => {
    button.disabled = true;
  });
}

function startGame() {
  let nickname = sessionStorage.getItem("nickname");

  if (!nickname) {
    nickname = prompt("Enter your nickname (max 10 characters):");
    if (nickname) {
      nickname = nickname.trim().substring(0, 10);
      sessionStorage.setItem("nickname", nickname);
    } else {
      return;
    }
  }

  if (gameState.sequence.length === 0) {
    generateSequence();
    startButton.disabled = true;
    repeatButton.disabled = false;
    gameState.repeatUsed = false;
    startButton.remove();
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
  resetButton.disabled = gameState.sequence.length === 0;
  if (gameState.sequence.length > 0) {
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
  if (
    gameState.isGameOver ||
    gameState.sequence.length === 0 ||
    gameState.repeatUsed
  ) {
    repeatButton.disabled = true;
    return;
  }

  colorButtons.forEach((button) => (button.disabled = true));
  resetButton.disabled = true;

  displaySequence();

  setTimeout(() => {
    colorButtons.forEach((button) => (button.disabled = false));
    resetButton.disabled = false;

    gameState.repeatUsed = true;
    repeatButton.disabled = true;
  }, gameState.sequence.length * getTimeoutForCurrentLevel() * 2);
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
      showMessage("Your turn!", "message");
    }, 300);
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

// function displayGif() {
//   const gif = document.createElement("img");
//   gif.src = "gif1.gif";
//   gif.classList.add("gif-animation");
//   document.body.appendChild(gif);
// }

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
  startButton.remove();
  repeatButton.disabled = true;
  blackAndWhiteButton.disabled = true;
  showMessage(
    isWin ? "Congratulations, you're a robot!" : "Game Over!",
    isWin ? "win" : "game-over"
  );
  resetButton.textContent = "Try Again";
  updateLeaderboard();
  // if (isWin) {
  //   displayGif();
  // }
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
  startButton.remove();
  gameState.repeatUsed = false;
  repeatButton.disabled = false;
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
  levelElement.textContent = `Stage: ${gameState.currentLevel}`;
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

function updateLeaderboard() {
  const leaderboardDiv = document.getElementById("leaderboard");
  if (!leaderboardDiv) return;

  const currentLevel = gameState.currentLevel;
  let storedScores = JSON.parse(localStorage.getItem("scores")) || [];
  let storedNicknames = JSON.parse(localStorage.getItem("nicknames")) || {};

  storedScores = storedScores.filter(
    (score) =>
      typeof score.level === "number" &&
      !isNaN(score.level) &&
      score.date &&
      !isNaN(new Date(score.date).getTime())
  );

  if (gameState.isGameOver) {
    const nickname = sessionStorage.getItem("nickname");
    storedNicknames[currentLevel] = nickname;
    localStorage.setItem("nicknames", JSON.stringify(storedNicknames));

    const newScore = {
      level: currentLevel,
      date: new Date().toISOString(),
      nickname: storedNicknames[currentLevel],
    };
    storedScores.push(newScore);
  }

  storedScores.sort((a, b) => {
    if (b.level !== a.level) {
      return b.level - a.level;
    }
    return new Date(b.date) - new Date(a.date);
  });

  storedScores = storedScores.slice(0, 5);

  localStorage.setItem("scores", JSON.stringify(storedScores));

  leaderboardDiv.innerHTML = "";

  const leaderboardList = document.createElement("ul");

  storedScores.forEach((score, index) => {
    const listItem = document.createElement("li");
    const scoreDate = new Date(score.date);
    const formattedDate = scoreDate.toLocaleDateString();
    listItem.textContent = `${index + 1}: Stage ${score.level} (${
      score.nickname
    }) - ${formattedDate}`;
    leaderboardList.appendChild(listItem);
  });

  leaderboardDiv.appendChild(leaderboardList);
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
