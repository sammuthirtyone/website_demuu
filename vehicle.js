class Vehicle {
    constructor(type, config) {
        this.type = type;
        this.config = config;
        
        // Physics properties
        this.position = { x: 100, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.angle = 0;
        this.angularVelocity = 0;
        
        // Control states
        this.acceleration = 0;
        this.braking = false;
        this.flipping = false;
        
        // Vehicle stats
        this.fuel = config.fuelCapacity;
        this.fuelCapacity = config.fuelCapacity;
        this.health = 100;
        
        // Upgrades
        this.upgrades = {
            engine: 1,
            suspension: 1,
            tires: 1,
            fuelTank: 1
        };
    }
    
    reset() {
        this.position = { x: 100, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.angle = 0;
        this.angularVelocity = 0;
        this.fuel = this.fuelCapacity * this.upgrades.fuelTank;
        this.health = 100;
    }
    
    accelerate(power) {
        this.acceleration = power;
    }
    
    brake(power) {
        this.braking = power > 0;
    }
    
    flip() {
        if (!this.flipping) {
            this.angularVelocity += 5;
            this.flipping = true;
            setTimeout(() => this.flipping = false, 1000);
        }
    }
    
    update(deltaTime, terrain) {
        // Apply engine force
        if (this.acceleration > 0 && this.fuel > 0) {
            const powerMultiplier = this.upgrades.engine * this.config.power;
            const force = this.acceleration * powerMultiplier * 10;
            this.velocity.x += force * deltaTime;
            this.fuel -= 0.1 * deltaTime;
        }
        
        // Apply braking
        if (this.braking) {
            this.velocity.x *= 0.95;
        }
        
        // Apply gravity
        this.velocity.y += 9.8 * deltaTime;
        
        // Get terrain info at current position
        const terrainInfo = terrain.getTerrainInfo(this.position.x);
        
        // Apply surface angle and friction
        const surfaceAngle = terrainInfo.angle;
        const surfaceFriction = terrainInfo.friction * this.upgrades.tires;
        
        // Adjust velocity based on surface
        this.velocity.x *= (1 - (1 - surfaceFriction) * deltaTime);
        
        // Update position
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        
        // Update rotation based on surface and physics
        const angleDiff = surfaceAngle - this.angle;
        this.angularVelocity = angleDiff * 0.5;
        this.angle += this.angularVelocity * deltaTime;
        
        // Apply suspension
        const suspensionForce = Math.max(0, terrainInfo.height - this.position.y) * 
                              this.upgrades.suspension * this.config.suspension * 20;
        if (suspensionForce > 0) {
            this.velocity.y -= suspensionForce * deltaTime;
            this.position.y = terrainInfo.height;
        }
        
        // Check for collision damage
        if (Math.abs(this.angularVelocity) > 3 || Math.abs(this.velocity.y) > 10) {
            const impact = Math.abs(this.angularVelocity) * 0.1 + Math.abs(this.velocity.y) * 0.5;
            this.health -= impact * deltaTime;
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.angle);
        
        // Draw vehicle body
        ctx.fillStyle = this.getVehicleColor();
        ctx.fillRect(
            -this.config.width / 2, 
            -this.config.height / 2, 
            this.config.width, 
            this.config.height
        );
        
        // Draw wheels
        ctx.fillStyle = '#333';
        const wheelRadius = this.config.height / 3;
        
        // Front wheel
        ctx.beginPath();
        ctx.arc(
            this.config.width / 2 - wheelRadius, 
            this.config.height / 2 - wheelRadius, 
            wheelRadius, 
            0, 
            Math.PI * 2
        );
        ctx.fill();
        
        // Rear wheel
        ctx.beginPath();
        ctx.arc(
            -this.config.width / 2 + wheelRadius, 
            this.config.height / 2 - wheelRadius, 
            wheelRadius, 
            0, 
            Math.PI * 2
        );
        ctx.fill();
        
        ctx.restore();
    }
    
    getVehicleColor() {
        const colors = {
            bike: '#FF5555',
            car: '#5555FF',
            truck: '#55AA55'
        };
        return colors[this.type] || '#AAAAAA';
    }
}
