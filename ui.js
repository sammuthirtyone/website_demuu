class UIManager {
    constructor(game) {
        this.game = game;
        this.elements = {};
        this.animations = [];
        
        this.initUIElements();
    }
    
    initUIElements() {
        // Speedometer
        this.elements.speedometer = document.createElement('div');
        this.elements.speedometer.className = 'speedometer';
        this.elements.speedometer.innerHTML = `
            <div class="speed-value">0</div>
            <div class="speed-label">KM/H</div>
            <div class="nitro-bar"><div class="nitro-fill"></div></div>
        `;
        document.body.appendChild(this.elements.speedometer);
        
        // Lap counter
        this.elements.lapCounter = document.createElement('div');
        this.elements.lapCounter.className = 'lap-counter';
        this.elements.lapCounter.textContent = 'Lap: 1/3';
        document.body.appendChild(this.elements.lapCounter);
        
        // Weather effects
        this.elements.weather = document.createElement('div');
        this.elements.weather.className = 'weather-rain';
        document.body.appendChild(this.elements.weather);
    }
    
    update(deltaTime) {
        // Update player UI
        if (this.game.players.length > 0) {
            const player = this.game.players[0];
            this.elements.speedometer.querySelector('.speed-value').textContent = Math.floor(player.speed);
            this.elements.speedometer.querySelector('.nitro-fill').style.width = `${player.nitro}%`;
            
            this.elements.lapCounter.textContent = `Lap: ${player.lapCount}/3`;
        }
        
        // Update weather effects
        this.updateWeatherEffects();
        
        // Update animations
        this.updateAnimations(deltaTime);
    }
    
    updateWeatherEffects() {
        switch (this.game.weather) {
            case 'rain':
                this.elements.weather.style.opacity = '0.6';
                this.elements.weather.style.display = 'block';
                break;
            case 'snow':
                // Similar to rain but with different visuals
                break;
            default:
                this.elements.weather.style.opacity = '0';
        }
    }
    
    showMessage(text, duration = 2000) {
        const msg = document.createElement('div');
        msg.className = 'game-message';
        msg.textContent = text;
        document.body.appendChild(msg);
        
        setTimeout(() => {
            msg.style.opacity = '0';
            setTimeout(() => msg.remove(), 500);
        }, duration);
    }
    
    addAnimation(animation) {
        this.animations.push(animation);
    }
    
    updateAnimations(deltaTime) {
        this.animations = this.animations.filter(anim => {
            anim.update(deltaTime);
            return !anim.completed;
        });
    }
    
    render(ctx) {
        // Render all UI animations
        this.animations.forEach(anim => anim.render(ctx));
    }
}
