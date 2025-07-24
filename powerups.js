class TimeRewindPowerup {
    constructor(position) {
        this.position = position;
        this.radius = 20;
        this.collected = false;
        this.rewindTime = 5; // seconds
        this.sprite = new Image();
        this.sprite.src = 'assets/images/powerups/time_orb.png';
        
        this.pulsePhase = 0;
    }
    
    update(deltaTime) {
        this.pulsePhase = (this.pulsePhase + deltaTime * 2) % (Math.PI * 2);
    }
    
    render(ctx) {
        if (this.collected) return;
        
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        
        // Pulse effect
        const scale = 1 + Math.sin(this.pulsePhase) * 0.1;
        ctx.scale(scale, scale);
        
        // Draw powerup
        ctx.drawImage(
            this.sprite,
            -this.radius,
            -this.radius,
            this.radius * 2,
            this.radius * 2
        );
        
        ctx.restore();
    }
    
    collect(car, game) {
        if (this.collected) return;
        
        this.collected = true;
        game.audioManager.play('time-rewind');
        
        // Create visual effect
        game.addTimeRewindEffect(this.position);
        
        // Activate rewind for the car
        car.activateTimeRewind(this.rewindTime);
        
        // Respawn after some time
        setTimeout(() => {
            this.collected = false;
        }, 10000);
    }
}

class TimeRewindEffect {
    constructor(position) {
        this.position = position;
        this.radius = 5;
        this.maxRadius = 500;
        this.duration = 1.0;
        this.time = 0;
        this.active = true;
    }
    
    update(deltaTime) {
        this.time += deltaTime;
        this.radius = this.maxRadius * (this.time / this.duration);
        
        if (this.time >= this.duration) {
            this.active = false;
        }
    }
    
    render(ctx) {
        const alpha = 1 - (this.time / this.duration);
        ctx.save();
        
        // Create distortion effect
        ctx.beginPath();
        ctx.arc(
            this.position.x,
            this.position.y,
            this.radius,
            0,
            Math.PI * 2
        );
        
        const gradient = ctx.createRadialGradient(
            this.position.x,
            this.position.y,
            this.radius * 0.3,
            this.position.x,
            this.position.y,
            this.radius
        );
        
        gradient.addColorStop(0, `rgba(100, 200, 255, ${alpha * 0.8})`);
        gradient.addColorStop(1, `rgba(100, 200, 255, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        ctx.restore();
    }
}
