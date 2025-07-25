class QuantumRacer {
    constructor() {
        this.initEventListeners();
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    initEventListeners() {
        document.addEventListener('assetsLoaded', () => {
            this.startGame();
        });
    }

    startGame() {
        console.log("All assets loaded - starting game!");
        // Your game initialization code here
        const game = new GameEngine();
        game.start();
    }
}

new QuantumRacer();
