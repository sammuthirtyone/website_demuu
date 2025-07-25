class QuantumRacer {
    constructor() {
        // Game state
        this.currentScreen = 'main-menu';
        this.selectedTrack = 'neo-tokyo';
        this.audioEnabled = true;
        
        // DOM elements
        this.screens = {
            'main-menu': document.getElementById('main-menu'),
            'single-player': document.getElementById('single-player-screen'),
            'game': document.getElementById('game-wrapper')
        };
        
        this.buttons = {
            'single-player': document.getElementById('single-player'),
            'multiplayer': document.getElementById('multiplayer'),
            'track-editor': document.getElementById('track-editor'),
            'customize': document.getElementById('customize'),
            'back': document.querySelector('.back-btn'),
            'start-race': document.getElementById('start-race')
        };
        
        this.trackOptions = document.querySelectorAll('.track-option');
        
        // Audio elements
        this.audio = {
            'menu-music': document.getElementById('menu-music'),
            'click': document.getElementById('click-sound'),
            'hover': document.getElementById('hover-sound')
        };
        
        // Initialize
        this.initEventListeners();
        this.playMenuMusic();
    }
    
    initEventListeners() {
        // Menu navigation
        this.buttons['single-player'].addEventListener('click', () => {
            this.playSound('click');
            this.switchScreen('single-player');
        });
        
        this.buttons['multiplayer'].addEventListener('click', () => {
            this.playSound('click');
            this.showComingSoon('Local Multiplayer');
        });
        
        this.buttons['track-editor'].addEventListener('click', () => {
            this.playSound('click');
            this.showComingSoon('Track Editor');
        });
        
        this.buttons['customize'].addEventListener('click', () => {
            this.playSound('click');
            this.showComingSoon('Car Customization');
        });
        
        // Back button
        this.buttons['back'].addEventListener('click', () => {
            this.playSound('click');
            this.switchScreen('main-menu');
        });
        
        // Track selection
        this.trackOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.playSound('click');
                this.selectTrack(option);
            });
        });
        
        // Start race
        this.buttons['start-race'].addEventListener('click', () => {
            this.playSound('click');
            this.startGame();
        });
        
        // Button hover effects
        const hoverElements = [
            ...document.querySelectorAll('.menu-btn'),
            ...document.querySelectorAll('.track-option'),
            document.querySelector('.back-btn'),
            document.querySelector('.start-btn')
        ];
        
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.playSound('hover');
            });
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentScreen !== 'main-menu') {
                this.playSound('click');
                this.switchScreen('main-menu');
            }
        });
    }
    
    switchScreen(screenName) {
        // Hide current screen
        this.screens[this.currentScreen].classList.remove('active');
        
        // Show new screen
        this.screens[screenName].classList.add('active');
        this.currentScreen = screenName;
        
        // Pause menu music when in game
        if (screenName === 'game') {
            this.audio['menu-music'].pause();
        } else {
            this.playMenuMusic();
        }
    }
    
    selectTrack(option) {
        // Remove selection from all options
        this.trackOptions.forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Select clicked option
        option.classList.add('selected');
        this.selectedTrack = option.dataset.track;
    }
    
    startGame() {
        this.switchScreen('game');
        
        // Initialize game (would be more complex in full implementation)
        const game = new GameEngine(this.selectedTrack);
        game.start();
    }
    
    showComingSoon(feature) {
        alert(`${feature} mode will be available in the next update!`);
    }
    
    playMenuMusic() {
        if (this.audioEnabled) {
            this.audio['menu-music'].volume = 0.3;
            this.audio['menu-music'].play().catch(e => {
                console.log('Autoplay prevented:', e);
                this.audioEnabled = false;
            });
        }
    }
    
    playSound(sound) {
        if (this.audioEnabled) {
            this.audio[sound].currentTime = 0;
            this.audio[sound].play().catch(e => {
                console.log('Sound playback prevented:', e);
            });
        }
    }
}

// Game engine would be implemented in game.js
class GameEngine {
    constructor(track) {
        this.track = track;
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.resize();
        window.addEventListener('resize', this.resize.bind(this));
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    start() {
        // In a full implementation, this would initialize the game loop
        console.log(`Starting race on ${this.track} track`);
        
        // For now, just show a message and return to menu after 3 seconds
        setTimeout(() => {
            alert(`Race on ${this.track.replace('-', ' ').toUpperCase()} completed!`);
            new QuantumRacer().switchScreen('main-menu');
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new QuantumRacer();
});
