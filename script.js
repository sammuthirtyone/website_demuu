// Game elements
const menuScreen = document.getElementById('menu-screen');
const instructionsScreen = document.getElementById('instructions-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startBtn = document.getElementById('start-btn');
const instructionsBtn = document.getElementById('instructions-btn');
const backToMenuBtn = document.getElementById('back-to-menu-btn');
const restartBtn = document.getElementById('restart-btn');
const menuBtn = document.getElementById('menu-btn');
const gameCanvas = document.getElementById('game-canvas');
const ctx = gameCanvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const timeElement = document.getElementById('time');
const finalScoreElement = document.getElementById('final-score');

// Game variables
let score = 0;
let lives = 3;
let gameTime = 60;
let gameInterval;
let timeInterval;
let isGameRunning = false;
let lastSpawnTime = 0;
let spawnRate = 1000; // milliseconds
let trail = [];
let maxTrailLength = 10;

// Fruit emojis
const fruits = ['🍎', '🍊', '🍋', '🍉', '🍓', '🍍', '🍌', '🍒', '🥝', '🍑', '🥭', '🍈'];
const specialFruits = ['🍒', '🍓', '🌟']; // These give bonus points
const bombEmojis = ['💣', '☠️']; // These deduct lives

// Fruit objects
let activeFruits = [];

// Set canvas size
function resizeCanvas() {
    gameCanvas.width = Math.min(window.innerWidth * 0.9, 800);
    gameCanvas.height = Math.min(window.innerHeight * 0.7, 500);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Button event listeners
startBtn.addEventListener('click', startGame);
instructionsBtn.addEventListener('click', showInstructions);
backToMenuBtn.addEventListener('click', showMenu);
restartBtn.addEventListener('click', startGame);
menuBtn.addEventListener('click', showMenu);

// Screen navigation functions
function showMenu() {
    menuScreen.classList.remove('hidden');
    instructionsScreen.classList.add('hidden');
    gameScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
}

function showInstructions() {
    menuScreen.classList.add('hidden');
    instructionsScreen.classList.remove('hidden');
}

function showGameScreen() {
    menuScreen.classList.add('hidden');
    instructionsScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
}

function showGameOver() {
    gameScreen.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    finalScoreElement.textContent = score;
}

// Game functions
function startGame() {
    // Reset game state
    score = 0;
    lives = 3;
    gameTime = 60;
    activeFruits = [];
    trail = [];
    
    // Update UI
    scoreElement.textContent = score;
    livesElement.textContent = '❤️'.repeat(lives);
    timeElement.textContent = gameTime;
    
    // Show game screen
    showGameScreen();
    
    // Start game loops
    if (isGameRunning) {
        clearInterval(gameInterval);
        clearInterval(timeInterval);
    }
    
    isGameRunning = true;
    gameInterval = setInterval(updateGame, 16); // ~60fps
    timeInterval = setInterval(updateTime, 1000);
    
    // Initial spawn
    spawnFruit();
    lastSpawnTime = Date.now();
}

function updateTime() {
    gameTime--;
    timeElement.textContent = gameTime;
    
    if (gameTime <= 0) {
        endGame();
    }
}

function updateGame() {
    // Clear canvas
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    
    // Spawn new fruits
    const currentTime = Date.now();
    if (currentTime - lastSpawnTime > spawnRate) {
        spawnFruit();
        lastSpawnTime = currentTime;
        
        // Increase difficulty as score increases
        spawnRate = Math.max(300, 1000 - score * 2);
    }
    
    // Update and draw fruits
    for (let i = activeFruits.length - 1; i >= 0; i--) {
        const fruit = activeFruits[i];
        
        // Update position
        fruit.y += fruit.speed;
        fruit.rotation += fruit.rotationSpeed;
        
        // Check if fruit is out of bounds
        if (fruit.y > gameCanvas.height) {
            if (!fruit.isSliced && !bombEmojis.includes(fruit.text)) {
                loseLife();
            }
            activeFruits.splice(i, 1);
            continue;
        }
        
        // Draw fruit
        drawFruit(fruit);
    }
    
    // Draw trail
    drawTrail();
}

function spawnFruit() {
    const fruitText = getRandomFruit();
    const isBomb = bombEmojis.includes(fruitText);
    const isSpecial = specialFruits.includes(fruitText);
    
    const fruit = {
        text: fruitText,
        x: Math.random() * (gameCanvas.width - 50),
        y: -50,
        size: isSpecial ? 40 : isBomb ? 35 : 30,
        speed: 2 + Math.random() * 3,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        isSliced: false,
        isBomb: isBomb,
        isSpecial: isSpecial,
        slices: [],
        slicedParts: []
    };
    
    activeFruits.push(fruit);
}

function getRandomFruit() {
    // 10% chance for special fruit, 15% for bomb, 75% for regular fruit
    const rand = Math.random();
    if (rand < 0.1) {
        return specialFruits[Math.floor(Math.random() * specialFruits.length)];
    } else if (rand < 0.25) {
        return bombEmojis[Math.floor(Math.random() * bombEmojis.length)];
    } else {
        return fruits[Math.floor(Math.random() * fruits.length)];
    }
}

function drawFruit(fruit) {
    ctx.save();
    ctx.translate(fruit.x + fruit.size / 2, fruit.y + fruit.size / 2);
    ctx.rotate(fruit.rotation);
    
    if (fruit.isSliced) {
        // Draw sliced parts
        ctx.font = `${fruit.size}px Arial`;
        
        // Create juice splash
        if (fruit.slices.length > 0 && !fruit.juiceDrawn) {
            const lastSlice = fruit.slices[fruit.slices.length - 1];
            drawJuiceSplash(lastSlice.x, lastSlice.y, fruit);
            fruit.juiceDrawn = true;
        }
        
        // Draw two halves of the fruit flying apart
        const timeSinceSliced = Date.now() - fruit.slicedTime;
        const separation = Math.min(30, timeSinceSliced / 10);
        
        // Left half
        ctx.save();
        ctx.rotate(-0.2);
        ctx.fillText(fruit.text, -fruit.size / 2 - separation, 0);
        ctx.restore();
        
        // Right half
        ctx.save();
        ctx.rotate(0.2);
        ctx.fillText(fruit.text, fruit.size / 2 + separation, 0);
        ctx.restore();
        
    } else {
        // Draw whole fruit
        ctx.font = `${fruit.size}px Arial`;
        ctx.fillText(fruit.text, -fruit.size / 2, 0);
    }
    
    ctx.restore();
}

function drawJuiceSplash(x, y, fruit) {
    ctx.save();
    ctx.translate(x, y);
    
    // Juice color based on fruit type
    let juiceColor;
    switch(fruit.text) {
        case '🍎': juiceColor = 'rgba(237, 41, 57, 0.7)'; break;
        case '🍊': juiceColor = 'rgba(255, 165, 0, 0.7)'; break;
        case '🍋': juiceColor = 'rgba(255, 234, 0, 0.7)'; break;
        case '🍉': juiceColor = 'rgba(255, 71, 87, 0.7)'; break;
        case '🍓': juiceColor = 'rgba(255, 71, 87, 0.7)'; break;
        case '🍍': juiceColor = 'rgba(255, 204, 0, 0.7)'; break;
        case '🍌': juiceColor = 'rgba(255, 225, 53, 0.7)'; break;
        default: juiceColor = 'rgba(255, 87, 34, 0.7)';
    }
    
    // Draw juice droplets
    for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 10 + Math.random() * 20;
        const size = 3 + Math.random() * 5;
        
        ctx.beginPath();
        ctx.arc(
            Math.cos(angle) * distance,
            Math.sin(angle) * distance,
            size, 0, Math.PI * 2
        );
        ctx.fillStyle = juiceColor;
        ctx.fill();
    }
    
    ctx.restore();
}

function drawTrail() {
    if (trail.length < 2) return;
    
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(trail[0].x, trail[0].y);
    
    for (let i = 1; i < trail.length; i++) {
        ctx.lineTo(trail[i].x, trail[i].y);
    }
    
    ctx.stroke();
}

function sliceFruit(x, y) {
    let sliced = false;
    
    for (let i = 0; i < activeFruits.length; i++) {
        const fruit = activeFruits[i];
        
        if (fruit.isSliced) continue;
        
        // Simple collision detection
        const distance = Math.sqrt(
            Math.pow(x - (fruit.x + fruit.size / 2), 2) + 
            Math.pow(y - (fruit.y + fruit.size / 2), 2)
        );
        
        if (distance < fruit.size) {
            fruit.isSliced = true;
            fruit.slicedTime = Date.now();
            fruit.slices.push({ x, y });
            
            if (fruit.isBomb) {
                loseLife();
            } else {
                // Add score
                const points = fruit.isSpecial ? 5 : 1;
                score += points;
                scoreElement.textContent = score;
                
                // Remove fruit after a delay
                setTimeout(() => {
                    const index = activeFruits.indexOf(fruit);
                    if (index !== -1) {
                        activeFruits.splice(index, 1);
                    }
                }, 300);
            }
            
            sliced = true;
        }
    }
    
    return sliced;
}

function loseLife() {
    lives--;
    livesElement.textContent = '❤️'.repeat(Math.max(0, lives));
    
    // Shake effect when losing life
    gameScreen.style.animation = 'shake 0.5s';
    setTimeout(() => {
        gameScreen.style.animation = '';
    }, 500);
    
    if (lives <= 0) {
        endGame();
    }
}

function endGame() {
    clearInterval(gameInterval);
    clearInterval(timeInterval);
    isGameRunning = false;
    showGameOver();
}

// Mouse/touch events
gameCanvas.addEventListener('mousemove', (e) => {
    const rect = gameCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    trail.push({ x, y });
    if (trail.length > maxTrailLength) {
        trail.shift();
    }
    
    sliceFruit(x, y);
});

gameCanvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = gameCanvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    trail.push({ x, y });
    if (trail.length > maxTrailLength) {
        trail.shift();
    }
    
    sliceFruit(x, y);
});

// Add shake animation to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// Initialize game
showMenu();
