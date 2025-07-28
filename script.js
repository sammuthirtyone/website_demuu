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

// Emojis to slice
const emojis = ['🍎', '🍌', '🍒', '🍓', '🍊', '🍋', '🍍', '🥝', '🍉', '🍇', '🥥', '🍑', '💣', '💎'];
const specialEmojis = ['💎', '🌟', '✨']; // These give bonus points
const bombEmojis = ['💣', '☠️']; // These deduct lives

// Emoji objects
let activeEmojis = [];

// Set canvas size
function resizeCanvas() {
    gameCanvas.width = window.innerWidth * 0.8;
    gameCanvas.height = window.innerHeight * 0.7;
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
    finalScoreElement.textContent = `Your score: ${score}`;
}

// Game functions
function startGame() {
    // Reset game state
    score = 0;
    lives = 3;
    gameTime = 60;
    activeEmojis = [];
    trail = [];
    
    // Update UI
    scoreElement.textContent = `Score: ${score}`;
    livesElement.textContent = '❤️'.repeat(lives);
    timeElement.textContent = `Time: ${gameTime}`;
    
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
    spawnEmoji();
    lastSpawnTime = Date.now();
}

function updateTime() {
    gameTime--;
    timeElement.textContent = `Time: ${gameTime}`;
    
    if (gameTime <= 0) {
        endGame();
    }
}

function updateGame() {
    // Clear canvas
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    
    // Spawn new emojis
    const currentTime = Date.now();
    if (currentTime - lastSpawnTime > spawnRate) {
        spawnEmoji();
        lastSpawnTime = currentTime;
    }
    
    // Update and draw emojis
    for (let i = activeEmojis.length - 1; i >= 0; i--) {
        const emoji = activeEmojis[i];
        
        // Update position
        emoji.y += emoji.speed;
        emoji.rotation += emoji.rotationSpeed;
        
        // Check if emoji is out of bounds
        if (emoji.y > gameCanvas.height) {
            if (!emoji.isSliced && !bombEmojis.includes(emoji.text)) {
                loseLife();
            }
            activeEmojis.splice(i, 1);
            continue;
        }
        
        // Draw emoji
        drawEmoji(emoji);
    }
    
    // Draw trail
    drawTrail();
}

function spawnEmoji() {
    const emojiText = getRandomEmoji();
    const isBomb = bombEmojis.includes(emojiText);
    const isSpecial = specialEmojis.includes(emojiText);
    
    const emoji = {
        text: emojiText,
        x: Math.random() * (gameCanvas.width - 50),
        y: -50,
        size: isSpecial ? 40 : isBomb ? 35 : 30,
        speed: 2 + Math.random() * 3,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        isSliced: false,
        isBomb: isBomb,
        isSpecial: isSpecial,
        slices: []
    };
    
    activeEmojis.push(emoji);
}

function getRandomEmoji() {
    // 10% chance for special emoji, 15% for bomb, 75% for regular fruit
    const rand = Math.random();
    if (rand < 0.1) {
        return specialEmojis[Math.floor(Math.random() * specialEmojis.length)];
    } else if (rand < 0.25) {
        return bombEmojis[Math.floor(Math.random() * bombEmojis.length)];
    } else {
        return emojis[Math.floor(Math.random() * (emojis.length - bombEmojis.length - specialEmojis.length))];
    }
}

function drawEmoji(emoji) {
    ctx.save();
    ctx.translate(emoji.x + emoji.size / 2, emoji.y + emoji.size / 2);
    ctx.rotate(emoji.rotation);
    
    if (emoji.isSliced) {
        // Draw sliced parts
        ctx.font = `${emoji.size}px Arial`;
        ctx.fillText(emoji.text, -emoji.size / 2 - 10, 0);
        ctx.fillText(emoji.text, emoji.size / 2 + 10, 0);
        
        // Draw slice effect
        if (emoji.slices.length > 0) {
            const lastSlice = emoji.slices[emoji.slices.length - 1];
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(lastSlice.x - emoji.x - emoji.size / 2, lastSlice.y - emoji.y - emoji.size / 2);
            ctx.lineTo(lastSlice.x - emoji.x - emoji.size / 2 + 30, lastSlice.y - emoji.y - emoji.size / 2 - 30);
            ctx.stroke();
        }
    } else {
        ctx.font = `${emoji.size}px Arial`;
        ctx.fillText(emoji.text, -emoji.size / 2, 0);
    }
    
    ctx.restore();
}

function drawTrail() {
    if (trail.length < 2) return;
    
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(trail[0].x, trail[0].y);
    
    for (let i = 1; i < trail.length; i++) {
        ctx.lineTo(trail[i].x, trail[i].y);
    }
    
    ctx.stroke();
}

function sliceEmoji(x, y) {
    let sliced = false;
    
    for (let i = 0; i < activeEmojis.length; i++) {
        const emoji = activeEmojis[i];
        
        if (emoji.isSliced) continue;
        
        // Simple collision detection
        const distance = Math.sqrt(
            Math.pow(x - (emoji.x + emoji.size / 2), 2) + 
            Math.pow(y - (emoji.y + emoji.size / 2), 2)
        );
        
        if (distance < emoji.size) {
            emoji.isSliced = true;
            emoji.slices.push({ x, y });
            
            if (emoji.isBomb) {
                loseLife();
            } else {
                // Add score
                const points = emoji.isSpecial ? 5 : 1;
                score += points;
                scoreElement.textContent = `Score: ${score}`;
                
                // Create floating text
                setTimeout(() => {
                    const index = activeEmojis.indexOf(emoji);
                    if (index !== -1) {
                        activeEmojis.splice(index, 1);
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
    livesElement.textContent = '❤️'.repeat(lives);
    
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
    
    sliceEmoji(x, y);
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
    
    sliceEmoji(x, y);
});

// Initialize game
showMenu();
