class GameEngine {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        document.getElementById('game-container').appendChild(this.canvas);
        this.resize();
        window.addEventListener('resize', this.resize.bind(this));
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    start() {
        console.log("Game started!");
        // Main game loop would go here
    }
}
