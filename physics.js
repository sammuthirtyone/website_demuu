class PhysicsEngine {
    constructor() {
        this.gravity = 9.8;
    }
    
    checkCollision(vehicle, object) {
        // Simple AABB collision detection
        const vehicleLeft = vehicle.position.x - vehicle.config.width / 2;
        const vehicleRight = vehicle.position.x + vehicle.config.width / 2;
        const vehicleTop = vehicle.position.y - vehicle.config.height / 2;
        const vehicleBottom = vehicle.position.y + vehicle.config.height / 2;
        
        const objectLeft = object.x - object.radius;
        const objectRight = object.x + object.radius;
        const objectTop = object.y - object.radius;
        const objectBottom = object.y + object.radius;
        
        return vehicleLeft < objectRight && 
               vehicleRight > objectLeft && 
               vehicleTop < objectBottom && 
               vehicleBottom > objectTop;
    }
    
    applyForce(body, force, deltaTime) {
        body.velocity.x += force.x * deltaTime;
        body.velocity.y += force.y * deltaTime;
    }
    
    resolveTerrainCollision(vehicle, terrainInfo) {
        // This would handle more complex collision responses
        // Currently handled in the Vehicle class
    }
}
