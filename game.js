class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        this.gameState = 'menu'; // menu, playing, garage, gameover
        this.score = 0;
        this.coins = 0;
        this.highScore = 0;
        
        this.vehicles = [];
        this.currentVehicleIndex = 0;
        
        this.lastTime = 0;
        this.deltaTime = 0;
        
        this.init();
    }
    
    init() {
        // Initialize systems
        this.physics = new PhysicsEngine();
        this.assets = new AssetManager();
        this.ui = new UIManager(this);
        this.terrain = new TerrainGenerator(this.width, this.height);
        
        // Create vehicles
        this.createVehicles();
        
        // Set up event listeners
        this.setupControls();
        this.setupUIEvents();
        
        // Start game loop
        this.gameLoop();
    }
    
    createVehicles() {
        // Basic vehicles
        this.vehicles.push(new Vehicle('bike', {
            width: 60,
            height: 30,
            power: 0.8,
            grip: 0.7,
            suspension: 0.6,
            fuelCapacity: 60
        }));
        
        this.vehicles.push(new Vehicle('car', {
            width: 80,
            height: 40,
            power: 1.0,
            grip: 1.0,
            suspension: 1.0,
            fuelCapacity: 100
        }));
        
        this.vehicles.push(new Vehicle('truck', {
            width: 100,
            height: 60,
            power: 1.5,
            grip: 1.2,
            suspension: 1.3,
            fuelCapacity: 150
        }));
        
        this.currentVehicle = this.vehicles[0];
    }
    
    setupControls() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (this.gameState !== 'playing') return;
            
            switch(e.key) {
                case 'ArrowUp':
                    this.currentVehicle.accelerate(1);
                    break;
                case 'ArrowDown':
                    this.currentVehicle.brake(1);
                    break;
                case ' ':
                    this.currentVehicle.flip();
                    break;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (this.gameState !== 'playing') return;
            
            switch(e.key) {
                case 'ArrowUp':
                    this.currentVehicle.accelerate(0);
                    break;
                case 'ArrowDown':
                    this.currentVehicle.brake(0);
                    break;
            }
        });
        
        // Touch controls
        document.getElementById('accelerate-btn').addEventListener('touchstart', () => {
            if (this.gameState === 'playing') this.currentVehicle.accelerate(1);
        });
        
        document.getElementById('accelerate-btn').addEventListener('touchend', () => {
            if (this.gameState === 'playing') this.currentVehicle.accelerate(0);
        });
        
        // Add similar for brake and flip buttons
    }
    
    setupUIEvents() {
        document.getElementById('play-btn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('garage-btn').addEventListener('click', () => {
            this.showGarage();
        });
        
        document.getElementById('back-btn').addEventListener('click', () => {
            this.showMenu();
        });
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.ui.updateActiveScreen('game-ui');
        this.currentVehicle.reset();
        this.terrain.generateNew();
    }
    
    showMenu() {
        this.gameState = 'menu';
        this.ui.updateActiveScreen('main-menu');
    }
    
    showGarage() {
        this.gameState = 'garage';
        this.ui.updateActiveScreen('garage-screen');
        this.ui.updateGarageScreen();
    }
    
    gameOver() {
        this.gameState = 'gameover';
        if (this.score > this.highScore) {
            this.highScore = this.score;
        }
        this.ui.showGameOver(this.score, this.highScore);
    }
    
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        // Update game elements
        this.currentVehicle.update(deltaTime, this.terrain);
        this.terrain.update(this.currentVehicle.position.x);
        
        // Update score
        this.score = Math.floor(this.currentVehicle.position.x / 10);
        this.ui.updateHUD(this.score, this.currentVehicle.fuel / this.currentVehicle.fuelCapacity);
        
        // Check for game over conditions
        if (this.currentVehicle.fuel <= 0 || this.currentVehicle.position.y > this.height + 100) {
            this.gameOver();
        }
        
        // Check for coin collection
        this.terrain.coins.forEach((coin, index) => {
            if (this.physics.checkCollision(this.currentVehicle, coin)) {
                this.coins += coin.value;
                this.terrain.coins.splice(index, 1);
                this.ui.updateCoinCount(this.coins);
            }
        });
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw background
        this.terrain.renderBackground(this.ctx);
        
        // Draw terrain
        this.terrain.render(this.ctx);
        
        // Draw coins
        this.terrain.coins.forEach(coin => {
            coin.render(this.ctx);
        });
        
        // Draw vehicle
        this.currentVehicle.render(this.ctx);
    }
    
    gameLoop(timestamp) {
        this.deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;
        
        this.update(this.deltaTime);
        this.render();
        
        requestAnimationFrame((t) => this.gameLoop(t));
    }
}

// Initialize game when assets are loaded
window.addEventListener('load', () => {
    const game = new Game();
});
