const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');

// Game settings
const gridSize = 20;
let canvasSize = 400;

// Game state
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop = null;
let gameSpeed = 100;
let isGameRunning = false;
let isPaused = false;
let backgroundColor = '#1a1a2e';
let currentFruitEmoji = '🍎';
let particles = [];
let explosionActive = false;

highScoreElement.textContent = highScore;

// Function to set canvas size based on container width
function resizeCanvas() {
    const container = document.querySelector('.game-container');
    const containerWidth = container.clientWidth - 60; // Account for padding
    const maxSize = Math.min(containerWidth, 500);
    canvasSize = Math.floor(maxSize / gridSize) * gridSize;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    if (!isGameRunning) {
        initGame();
        draw();
    }
}

// Initial canvas size
resizeCanvas();

// Resize event listener
window.addEventListener('resize', resizeCanvas);

// Generate random color
function getRandomColor() {
    const colors = [
        '#1a1a2e', '#16213e', '#0f3460', '#533483', '#e94560',
        '#2d132c', '#801336', '#c72c41', '#ee4540', '#c70039',
        '#900c3f', '#581845', '#1b262c', '#0f4c75', '#3282b8',
        '#bbe1fa', '#2c3e50', '#34495e', '#7f8c8d', '#95a5a6',
        '#1e3799', '#0c2461', '#4a69bd', '#6a89cc', '#82ccdd'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Get random fruit emoji
function getRandomFruit() {
    const fruits = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍑', '🍒', '🥝', '🍍', '🥭', '🍐', '🍌', '🫐', '🍉', '🍈'];
    return fruits[Math.floor(Math.random() * fruits.length)];
}

// Create explosion particles
function createExplosion(x, y) {
    const colors = ['#ff6b6b', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43', '#ee5a24'];
    for (let i = 0; i < 30; i++) {
        const angle = (Math.PI * 2 * i) / 30;
        const speed = 2 + Math.random() * 4;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: 3 + Math.random() * 5
        });
    }
}

// Update and draw explosion particles
function updateExplosion() {
    if (particles.length === 0) {
        explosionActive = false;
        return false;
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // gravity
        p.life -= 0.02;
        p.size *= 0.98;

        if (p.life <= 0) {
            particles.splice(i, 1);
        } else {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        }
    }
    return true;
}

// Initialize game
function initGame() {
    const gridCount = canvasSize / gridSize;
    const startX = Math.floor(gridCount / 2);
    const startY = Math.floor(gridCount / 2);
    
    snake = [
        { x: startX, y: startY },
        { x: startX - 1, y: startY },
        { x: startX - 2, y: startY }
    ];
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    scoreElement.textContent = score;
    backgroundColor = '#1a1a2e';
    currentFruitEmoji = '🍎';
    spawnFood();
}

// Spawn food at random position
function spawnFood() {
    const gridCount = canvasSize / gridSize;
    do {
        food = {
            x: Math.floor(Math.random() * gridCount),
            y: Math.floor(Math.random() * gridCount)
        };
    } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
}

// Draw game elements
function draw() {
    // Clear canvas with current background color
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Draw grid
    ctx.strokeStyle = '#16213e';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= canvasSize; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvasSize);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvasSize, i);
        ctx.stroke();
    }

    // Draw food as emoji
    ctx.font = `${gridSize - 4}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
    ctx.shadowBlur = 5;
    ctx.fillText(
        currentFruitEmoji,
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2
    );
    ctx.shadowBlur = 0;

    // Draw snake
    snake.forEach((segment, index) => {
        const gradient = ctx.createRadialGradient(
            segment.x * gridSize + gridSize / 2,
            segment.y * gridSize + gridSize / 2,
            0,
            segment.x * gridSize + gridSize / 2,
            segment.y * gridSize + gridSize / 2,
            gridSize / 2
        );
        
        if (index === 0) {
            gradient.addColorStop(0, '#00ff88');
            gradient.addColorStop(1, '#00cc6a');
        } else {
            gradient.addColorStop(0, '#00cc6a');
            gradient.addColorStop(1, '#009950');
        }
        
        ctx.fillStyle = gradient;
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = index === 0 ? 15 : 5;
        
        ctx.beginPath();
        ctx.roundRect(
            segment.x * gridSize + 1,
            segment.y * gridSize + 1,
            gridSize - 2,
            gridSize - 2,
            4
        );
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw eyes on head
        if (index === 0) {
            ctx.fillStyle = '#1a1a2e';
            const eyeOffset = gridSize / 4;
            const eyeSize = 3;
            
            let eye1X, eye1Y, eye2X, eye2Y;
            
            switch (direction) {
                case 'right':
                    eye1X = segment.x * gridSize + gridSize - eyeOffset;
                    eye1Y = segment.y * gridSize + eyeOffset;
                    eye2X = segment.x * gridSize + gridSize - eyeOffset;
                    eye2Y = segment.y * gridSize + gridSize - eyeOffset;
                    break;
                case 'left':
                    eye1X = segment.x * gridSize + eyeOffset;
                    eye1Y = segment.y * gridSize + eyeOffset;
                    eye2X = segment.x * gridSize + eyeOffset;
                    eye2Y = segment.y * gridSize + gridSize - eyeOffset;
                    break;
                case 'up':
                    eye1X = segment.x * gridSize + eyeOffset;
                    eye1Y = segment.y * gridSize + eyeOffset;
                    eye2X = segment.x * gridSize + gridSize - eyeOffset;
                    eye2Y = segment.y * gridSize + eyeOffset;
                    break;
                case 'down':
                    eye1X = segment.x * gridSize + eyeOffset;
                    eye1Y = segment.y * gridSize + gridSize - eyeOffset;
                    eye2X = segment.x * gridSize + gridSize - eyeOffset;
                    eye2Y = segment.y * gridSize + gridSize - eyeOffset;
                    break;
            }
            
            ctx.beginPath();
            ctx.arc(eye1X, eye1Y, eyeSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(eye2X, eye2Y, eyeSize, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

// Update game state
function update() {
    direction = nextDirection;
    
    const head = { ...snake[0] };
    
    switch (direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }

    // Check wall collision
    if (head.x < 0 || head.x >= canvasSize / gridSize ||
        head.y < 0 || head.y >= canvasSize / gridSize) {
        const collisionX = Math.max(0, Math.min(head.x, (canvasSize / gridSize) - 1)) * gridSize + gridSize / 2;
        const collisionY = Math.max(0, Math.min(head.y, (canvasSize / gridSize) - 1)) * gridSize + gridSize / 2;
        gameOver(collisionX, collisionY);
        return;
    }

    // Check self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        spawnFood();
        backgroundColor = getRandomColor();
        currentFruitEmoji = getRandomFruit();
        
        // Increase speed slightly
        if (gameSpeed > 50) {
            gameSpeed -= 2;
            clearInterval(gameLoop);
            gameLoop = setInterval(gameStep, gameSpeed);
        }
    } else {
        snake.pop();
    }
}

// Game step
function gameStep() {
    if (!isPaused) {
        update();
        draw();
    }
}

// Start game
function startGame() {
    if (isGameRunning) {
        return;
    }
    
    initGame();
    isGameRunning = true;
    isPaused = false;
    gameSpeed = 100;
    startBtn.textContent = 'Restart';
    pauseBtn.textContent = 'Pause';
    pauseBtn.disabled = false;
    gameLoop = setInterval(gameStep, gameSpeed);
    draw();
}

// Pause/Resume game
function togglePause() {
    if (!isGameRunning) return;
    
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
}

// Game over
function gameOver(collisionX, collisionY) {
    clearInterval(gameLoop);
    isGameRunning = false;
    startBtn.textContent = 'Start Game';
    pauseBtn.disabled = true;
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreElement.textContent = highScore;
    }
    
    // Create explosion at collision point
    if (collisionX !== undefined && collisionY !== undefined) {
        createExplosion(collisionX, collisionY);
        explosionActive = true;
        animateExplosion();
    } else {
        showGameOverScreen();
    }
}

// Animate explosion then show game over screen
function animateExplosion() {
    function animationLoop() {
        draw();
        const stillExploding = updateExplosion();
        if (stillExploding) {
            requestAnimationFrame(animationLoop);
        } else {
            showGameOverScreen();
        }
    }
    animationLoop();
}

// Show game over screen
function showGameOverScreen() {
    // Draw game over message
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvasSize / 2, canvasSize / 2 - 20);
    
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, canvasSize / 2, canvasSize / 2 + 20);
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (!isGameRunning || isPaused) return;
    
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (direction !== 'left') nextDirection = 'right';
            break;
        case ' ':
            togglePause();
            break;
    }
    
    e.preventDefault();
});

// Button event listeners
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
pauseBtn.disabled = true;

// Touch controls for mobile
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    if (!isGameRunning || isPaused) return;
    
    touchEndX = e.changedTouches[0].clientX;
    touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    const minSwipeDistance = 30;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0 && direction !== 'left') {
                nextDirection = 'right';
            } else if (deltaX < 0 && direction !== 'right') {
                nextDirection = 'left';
            }
        }
    } else {
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipeDistance) {
            if (deltaY > 0 && direction !== 'up') {
                nextDirection = 'down';
            } else if (deltaY < 0 && direction !== 'down') {
                nextDirection = 'up';
            }
        }
    }
    
    e.preventDefault();
}, { passive: false });

// Initial draw
initGame();
draw();
