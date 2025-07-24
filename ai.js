class AICar extends Car {
    constructor(type, position) {
        super(`ai_${type}`, position);
        this.type = type;
        this.aiBehavior = this.createBehavior(type);
        this.targetNode = 0;
        this.aggression = 0.5;
    }
    
    createBehavior(type) {
        switch (type) {
            case 'bully':
                return {
                    update: (deltaTime, track, player) => {
                        // Bully AI tries to ram the player
                        const playerDirection = Math.atan2(
                            player.position.y - this.position.y,
                            player.position.x - this.position.x
                        );
                        
                        this.angle = lerpAngle(
                            this.angle,
                            playerDirection,
                            deltaTime * 2
                        );
                        
                        this.speed = this.maxSpeed * 0.9;
                    }
                };
                
            case 'ghost':
                return {
                    update: (deltaTime, track, player) => {
                        // Ghost AI avoids collisions and takes optimal path
                        this.followPath(track, deltaTime);
                        this.speed = this.maxSpeed * 0.85;
                    }
                };
                
            case 'blocker':
                return {
                    update: (deltaTime, track, player) => {
                        // Blocker AI positions itself between player and next checkpoint
                        const nextCheckpoint = track.getNextCheckpoint(player);
                        const targetDirection = Math.atan2(
                            nextCheckpoint.y - this.position.y,
                            nextCheckpoint.x - this.position.x
                        );
                        
                        // Position between player and checkpoint
                        const targetPosition = {
                            x: player.position.x + (nextCheckpoint.x - player.position.x) * 0.7,
                            y: player.position.y + (nextCheckpoint.y - player.position.y) * 0.7
                        };
                        
                        const targetAngle = Math.atan2(
                            targetPosition.y - this.position.y,
                            targetPosition.x - this.position.x
                        );
                        
                        this.angle = lerpAngle(
                            this.angle,
                            targetAngle,
                            deltaTime * 1.5
                        );
                        
                        this.speed = this.maxSpeed * 0.8;
                    }
                };
                
            default:
                return {
                    update: (deltaTime, track) => {
                        this.followPath(track, deltaTime);
                        this.speed = this.maxSpeed * 0.8;
                    }
                };
        }
    }
    
    followPath(track, deltaTime) {
        const path = track.aiPath;
        if (!path || path.length === 0) return;
        
        const targetNode = path[this.targetNode % path.length];
        const distanceToNode = Math.hypot(
            targetNode.x - this.position.x,
            targetNode.y - this.position.y
        );
        
        if (distanceToNode < 50) {
            this.targetNode++;
        }
        
        const targetAngle = Math.atan2(
            targetNode.y - this.position.y,
            targetNode.x - this.position.x
        );
        
        this.angle = lerpAngle(
            this.angle,
            targetAngle,
            deltaTime * 1.2
        );
    }
    
    update(deltaTime, track, player) {
        this.aiBehavior.update(deltaTime, track, player);
        super.update(deltaTime, track);
    }
}

function lerpAngle(a, b, t) {
    const diff = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
    return a + diff * Math.min(t, 1);
}
