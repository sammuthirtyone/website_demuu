const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.querySelector('.score span');
const gameOverElement = document.querySelector('.game-over');

// Game settings
canvas.width = 400;
canvas.height = 600;
const roadWidth = canvas.width * 0.6;
const laneCount = 3;

// Game state
let score = 0;
let gameOver = false;
let animationId;
let speed = 3;

// Player car
const playerCar = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    width: 50,
    height: 90,
    speed: 5,
    color: '#3498db'
};

// Road
const road = {
    x: (canvas.width - roadWidth) / 2,
    y: 0,
    width: roadWidth,
    height: canvas.height,
    color: '#2c3e50',
    lanes: []
};

// Initialize lanes
for (let i = 0; i < laneCount; i++) {
    road.lanes.push(road.x + (i * roadWidth / (laneCount - 1)));
}

// Obstacles
let obstacles = [];
let obstacleFrequency = 120; // frames

// Game loop
function gameLoop() {
    update();
    draw();
    
    if (!gameOver) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

function update() {
    // Move road (illusion of car moving)
    road.y += speed;
    if (road.y >= canvas.height) {
        road.y = 0;
    }
    
    // Spawn obstacles
    if (frameCount % obstacleFrequency === 0) {
        spawnObstacle();
    }
    
    // Update obstacles
    obstacles.forEach((obstacle, index) => {
        obstacle.y += speed;
        
        // Check collision
        if (detectCollision(playerCar, obstacle)) {
            gameOver = true;
            gameOverElement.style.display = 'block';
            cancelAnimationFrame(animationId);
        }
        
        // Remove off-screen obstacles
        if (obstacle.y > canvas.height) {
            obstacles.splice(index, 1);
            score++;
            scoreElement.textContent = score;
            
            // Increase difficulty
            if (score % 5 === 0) {
                speed += 0.5;
                if (obstacleFrequency > 60) {
                    obstacleFrequency -= 5;
                }
            }
        }
    });
    
    frameCount++;
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#34495e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw road
    ctx.fillStyle = road.color;
    ctx.fillRect(road.x, road.y, road.width, road.height);
    ctx.fillRect(road.x, road.y - canvas.height, road.width, road.height);
    
    // Draw lane markers
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    for (let i = 1; i < laneCount; i++) {
        const laneX = road.lanes[i];
        ctx.beginPath();
        ctx.setLineDash([30, 30]);
        ctx.moveTo(laneX, road.y);
        ctx.lineTo(laneX, road.y + road.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(laneX, road.y - canvas.height);
        ctx.lineTo(laneX, road.y - canvas.height + road.height);
        ctx.stroke();
    }
    
    // Draw player car
    ctx.fillStyle = playerCar.color;
    ctx.fillRect(
        playerCar.x - playerCar.width / 2,
        playerCar.y - playerCar.height / 2,
        playerCar.width,
        playerCar.height
    );
    
    // Draw obstacles
    ctx.fillStyle = '#e74c3c';
    obstacles.forEach(obstacle => {
        ctx.fillRect(
            obstacle.x - obstacle.width / 2,
            obstacle.y - obstacle.height / 2,
            obstacle.width,
            obstacle.height
        );
    });
}

function spawnObstacle() {
    const lane = Math.floor(Math.random() * laneCount);
    const width = 50 + Math.random() * 30;
    const height = 70 + Math.random() * 40;
    
    obstacles.push({
        x: road.lanes[lane],
        y: -height,
        width: width,
        height: height
    });
}

function detectCollision(rect1, rect2) {
    return (
        rect1.x - rect1.width / 2 < rect2.x + rect2.width / 2 &&
        rect1.x + rect1.width / 2 > rect2.x - rect2.width / 2 &&
        rect1.y - rect1.height / 2 < rect2.y + rect2.height / 2 &&
        rect1.y + rect1.height / 2 > rect2.y - rect2.height / 2
    );
}

// Input handling
window.addEventListener('keydown', (e) => {
    if (gameOver && e.key.toLowerCase() === 'r') {
        resetGame();
        return;
    }
    
    if (gameOver) return;
    
    switch (e.key) {
        case 'ArrowLeft':
            const leftLane = road.lanes[Math.max(0, road.lanes.findIndex(l => l === playerCar.x) - 1)];
            playerCar.x = leftLane || playerCar.x;
            break;
        case 'ArrowRight':
            const rightLane = road.lanes[Math.min(laneCount - 1, road.lanes.findIndex(l => l === playerCar.x) + 1)];
            playerCar.x = rightLane || playerCar.x;
            break;
    }
});

function resetGame() {
    obstacles = [];
    score = 0;
    speed = 3;
    obstacleFrequency = 120;
    frameCount = 0;
    gameOver = false;
    scoreElement.textContent = score;
    gameOverElement.style.display = 'none';
    playerCar.x = canvas.width / 2;
    playerCar.y = canvas.height - 100;
    gameLoop();
}

let frameCount = 0;
gameLoop();
