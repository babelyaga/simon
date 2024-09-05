Simon Says Game 🔴🔵🟡🟢 #SimonSaysGame

This is a simple JavaScript and HTML/CSS game application made for practicing vanilla Javascript and HTML&CSS. The goal of the game is to repeat the sequence of colors displayed by the game.

## Game Principles

- The game uses a simple event-driven architecture.
- The game state is managed using JavaScript objects.
- The game uses CSS animations and transitions to create visual effects.
- HTML elements are used for the user interface.
- Game state and UI will be built using modular functions and objects to manage game state and UI.
- A simple game loop manages the game flow.

## Game Features

- The game starts with a default color sequence.
- The game generates a new color in the sequence each time the player completes the current sequence.
- The “Repeat” button allows the player to repeat the sequence.
- The game keeps track of the player's progress and displays the current level.
- The game allows the player to start a new game or reset the current game.
- The game features a dynamic sequence display whose speed can be adjusted:
  - Default: 550 ms (used for the first few levels)
  - Medium: 350 ms (used for intermediate levels)
  - Fast: 250 ms (used for higher levels)
  - Very fast: 150 ms (used for the final level)
- As the game progresses, the sequence display speed increases and the game difficulty increases.

## How to play

1. once the game load click the “Start Game” button to begin the game.
2. Wait for the sequence to finish.
3. Repeat the sequence displayed.
4. Use the “Repeat” button if you need help (once per game).

## Bonus Features

- The game has a “black and white” mode, where all colors are replaced by gray.
- Resume the game with the “Reset” button.
- The game has a “Repeat” button that repeats the sequence only once per game. Use it wisely!

## Possible Future Updates

- Saving the game state to local storage, allowing the user to return to the sequence they left off.
- Increasing difficulty by adding two additional buttons to the sequence, for example, increasing from 4 to 6 buttons.

## Technical Details

- This game is made with JavaScript and HTML/CSS.
- The game uses CSS animations and transitions to create visual effects.
- HTML elements are used for the user interface.
- The game is built using modular functions and objects to manage game state and UI.
- Uses a simple game loop to manage game flow.
- UX considerations: The game is designed to be as easy to use as possible, with clear, intuitive controls and a simple, visually appealing interface. The game difficulty increases gradually, allowing players to become accustomed to the pace and mechanics of the game.
- DOM manipulation: manipulate HTML elements using JavaScript, including adding event listeners, styling elements, and updating game state.
- Creating Dynamic Elements: Use JavaScript to create dynamic HTML elements such as sequence displays.
- CSS Selectors: Use CSS selectors to target and style specific HTML elements.
- JavaScript timer functions: Use JavaScript timer functions such as setTimeout and setInterval to manage game flow and create visual effects.
