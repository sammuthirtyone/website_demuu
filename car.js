class Car {
    constructor(type, position) {
        this.type = type;
        this.position = position;
        this.velocity = { x: 0, y: 0 };
        this.angle = 0;
        this.speed = 0;
        this.maxSpeed = 200;
        this.acceleration = 50;
        this.rotationSpeed = 2.5;
        this.driftFactor = 0;
        this.nitro = 100;
        this.health = 100;
        
        this.sprite = new Image();
        this.sprite.src = `assets/images/cars/${type}.png`;
        
        this.trailParticles = [];
        this.lastDriftTime = 0;
    }
    
    update(deltaTime, track) {
        // Apply friction
        this.speed *= (1 - 0.2 * deltaTime);
        
        // Update position based on velocity
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        
        // Track collision detection
        this.checkTrackCollision(track);
        
        // Update drift state
        if (Math.abs(this.driftFactor) > 0.1) {
            this.updateDrift(deltaTime);
        }
        
        // Update particles
        this.updateParticles(deltaTime);
    }
    
    handleInput(key, isPressed) {
        // Keyboard controls implementation
        switch (key) {
            case 'ArrowUp':
            case 'w':
                this.accelerating = isPressed;
                break;
            case 'ArrowDown':
            case 's':
                this.braking = isPressed;
                break;
            case 'ArrowLeft':
            case 'a':
                this.turningLeft = isPressed;
                break;
            case 'ArrowRight':
            case 'd':
                this.turningRight = isPressed;
                break;
            case 'Shift':
            case 'z':
                if (isPressed && this.nitro > 0) {
                    this.activateNitro();
                }
                break;
        }
    }
    
    activateNitro() {
        if (this.nitro <= 0) return;
        
        this.nitro -= 10;
        this.speed = Math.min(this.speed + 50, this.maxSpeed * 1.5);
        
        // Create boost particles
        for (let i = 0; i < 5; i++) {
            this.trailParticles.push({
                x: this.position.x,
                y: this.position.y,
                size: Math.random() * 5 + 2,
                life: 1.0,
                color: this.nitroColor
            });
        }
    }
    
    startDrift() {
        if (this.speed < 30) return;
        if (Date.now() - this.lastDriftTime < 1000) return;
        
        this.driftFactor = 1.0;
        this.lastDriftTime = Date.now();
        
        // Create smoke particles
        for (let i = 0; i < 10; i++) {
            this.trailParticles.push({
                x: this.position.x,
                y: this.position.y,
                size: Math.random() * 8 + 3,
                life: 1.5,
                color: '#888'
            });
        }
    }
    
    updateDrift(deltaTime) {
        this.driftFactor = Math.max(0, this.driftFactor - deltaTime);
        
        if (this.driftFactor > 0.1) {
            // Add more smoke while drifting
            if (Math.random() < 0.3) {
                this.trailParticles.push({
                    x: this.position.x,
                    y: this.position.y,
                    size: Math.random() * 6 + 2,
                    life: 1.0,
                    color: '#aaa'
                });
            }
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.angle);
        
        // Draw car
        ctx.drawImage(
            this.sprite,
            -this.sprite.width / 2,
            -this.sprite.height / 2,
            this.sprite.width,
            this.sprite.height
        );
        
        // Draw drift effect
        if (this.driftFactor > 0.1) {
            ctx.fillStyle = `rgba(255, 200, 50, ${this.driftFactor * 0.3})`;
            ctx.fillRect(
                -this.sprite.width / 2 - 10,
                -this.sprite.height / 2 - 5,
                this.sprite.width + 20,
                this.sprite.height + 10
            );
        }
        
        ctx.restore();
        
        // Render particles
        this.renderParticles(ctx);
    }
    
    // Additional car methods...
}

class PlayerCar extends Car {
    constructor(playerIndex, position) {
        super(`player${playerIndex + 1}`, position);
        this.playerIndex = playerIndex;
        this.lapCount = 0;
        this.checkpoints = [];
        this.score = 0;
    }
    
    // Player-specific methods...
}
