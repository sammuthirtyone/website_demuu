class UIManager {
    constructor(game) {
        this.game = game;
        this.setupUI();
    }
    
    setupUI() {
        this.distanceElement = document.querySelector('.hud-distance');
        this.coinElement = document.querySelector('.hud-coins');
        this.fuelElement = document.querySelector('.fuel-bar');
    }
    
    updateActiveScreen(screenId) {
        document.querySelectorAll('.ui-screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }
    
    updateHUD(distance, fuelPercent) {
        this.distanceElement.textContent = `${distance}m`;
        this.fuelElement.style.width = `${fuelPercent * 100}%`;
    }
    
    updateCoinCount(coins) {
        this.coinElement.textContent = coins;
    }
    
    updateGarageScreen() {
        const vehicleSelector = document.querySelector('.vehicle-selector');
        vehicleSelector.innerHTML = '';
        
        this.game.vehicles.forEach((vehicle, index) => {
            const thumbnail = document.createElement('div');
            thumbnail.className = `vehicle-thumbnail ${index === this.game.currentVehicleIndex ? 'active' : ''}`;
            thumbnail.textContent = vehicle.type.toUpperCase();
            thumbnail.addEventListener('click', () => {
                this.game.currentVehicleIndex = index;
                this.game.currentVehicle = this.game.vehicles[index];
                this.updateGarageScreen();
            });
            vehicleSelector.appendChild(thumbnail);
        });
        
        this.updateUpgradePanel();
    }
    
    updateUpgradePanel() {
        const upgradePanel = document.querySelector('.upgrade-panel');
        upgradePanel.innerHTML = `
            <h3>${this.game.currentVehicle.type.toUpperCase()} UPGRADES</h3>
            <div class="upgrade-item">
                <span>Engine</span>
                <button class="upgrade-btn">${this.game.currentVehicle.upgrades.engine}/5</button>
            </div>
            <div class="upgrade-item">
                <span>Suspension</span>
                <button class="upgrade-btn">${this.game.currentVehicle.upgrades.suspension}/5</button>
            </div>
            <div class="upgrade-item">
                <span>Tires</span>
                <button class="upgrade-btn">${this.game.currentVehicle.upgrades.tires}/5</button>
            </div>
            <div class="upgrade-item">
                <span>Fuel Tank</span>
                <button class="upgrade-btn">${this.game.currentVehicle.upgrades.fuelTank}/5</button>
            </div>
        `;
        
        // Add upgrade button event listeners
        document.querySelectorAll('.upgrade-btn').forEach((btn, index) => {
            btn.addEventListener('click', () => {
                const upgradeTypes = ['engine', 'suspension', 'tires', 'fuelTank'];
                const type = upgradeTypes[index];
                
                if (this.game.currentVehicle.upgrades[type] < 5 && this.game.coins >= 100) {
                    this.game.currentVehicle.upgrades[type] += 1;
                    this.game.coins -= 100;
                    this.updateGarageScreen();
                    this.updateCoinCount(this.game.coins);
                    
                    // Update vehicle stats
                    if (type === 'fuelTank') {
                        this.game.currentVehicle.fuelCapacity = this.game.currentVehicle.config.fuelCapacity * 
                                                             this.game.currentVehicle.upgrades.fuelTank;
                    }
                }
            });
        });
    }
    
    showGameOver(score, highScore) {
        const gameOverHTML = `
            <div class="game-over-dialog">
                <h2>GAME OVER</h2>
                <p>Distance: ${score}m</p>
                <p>High Score: ${highScore}m</p>
                <button id="restart-btn" class="menu-btn">PLAY AGAIN</button>
                <button id="menu-btn" class="menu-btn">MAIN MENU</button>
            </div>
        `;
        
        const gameOverScreen = document.createElement('div');
        gameOverScreen.className = 'ui-screen active';
        gameOverScreen.innerHTML = gameOverHTML;
        document.getElementById('game-container').appendChild(gameOverScreen);
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            gameOverScreen.remove();
            this.game.startGame();
        });
        
        document.getElementById('menu-btn').addEventListener('click', () => {
            gameOverScreen.remove();
            this.game.showMenu();
        });
    }
}
