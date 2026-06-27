# Snake Game

A modern, responsive snake game built with HTML, CSS, and JavaScript. Features smooth animations, particle effects, and touch controls for mobile devices.

## Features

- **Responsive Design**: Adapts to different screen sizes and works on desktop and mobile
- **Touch Controls**: Swipe gestures for mobile gameplay
- **Keyboard Controls**: Arrow keys or WASD for desktop gameplay
- **Dynamic Visuals**: 
  - Gradient snake with glowing effects
  - Random background colors on food collection
  - Random fruit emojis
  - Particle explosion effects on game over
- **Score Tracking**: Current score and persistent high score (saved to localStorage)
- **Pause/Resume**: Pause the game at any time
- **Speed Increase**: Game speeds up as you collect more food

## How to Play

### Desktop Controls
- **Arrow Keys** or **WASD**: Control snake direction
- **Spacebar**: Pause/Resume game
- **Start/Restart Button**: Begin or restart the game
- **Pause Button**: Pause/Resume game

### Mobile Controls
- **Swipe**: Swipe in the direction you want the snake to move
- **Buttons**: Use Start/Restart and Pause buttons

### Rules
- Guide the snake to eat the fruit to grow and score points
- Each fruit eaten adds 10 points
- Avoid hitting the walls or the snake's own body
- The game speeds up slightly with each fruit eaten
- Try to beat your high score!

## Installation

No installation required. Simply open `index.html` in a web browser.

## Files

- `index.html`: Main HTML structure
- `style.css`: Styling with responsive design
- `game.js`: Game logic and controls

## Technical Details

- Built with vanilla JavaScript (no frameworks)
- Uses HTML5 Canvas for rendering
- Responsive canvas sizing based on container width
- Touch event handling for mobile swipe gestures
- LocalStorage for persistent high score storage

## Browser Compatibility

Works in all modern browsers that support:
- HTML5 Canvas
- ES6 JavaScript
- Touch Events (for mobile)
