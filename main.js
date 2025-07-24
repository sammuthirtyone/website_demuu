document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const mainMenu = document.getElementById('main-menu');
    const singlePlayerBtn = document.getElementById('single-player');
    const multiplayerBtn = document.getElementById('multiplayer');
    const trackEditorBtn = document.getElementById('track-editor');
    const customizeBtn = document.getElementById('customize');
    const singlePlayerScreen = document.getElementById('single-player-screen');
    const backBtn = document.querySelector('.back-btn');
    const trackOptions = document.querySelectorAll('.track-option');
    const startRaceBtn = document.getElementById('start-race');
    
    let selectedTrack = 'neo-tokyo';
    
    // Button click sounds
    const clickSound = new Audio('assets/audio/click.wav');
    clickSound.volume = 0.3;
    
    // Play sound on any button click
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            clickSound.currentTime = 0;
            clickSound.play();
        });
    });
    
    // Main menu button handlers
    singlePlayerBtn.addEventListener('click', () => {
        mainMenu.classList.remove('active');
        singlePlayerScreen.classList.add('active');
    });
    
    multiplayerBtn.addEventListener('click', () => {
        alert('Local multiplayer mode coming soon!');
    });
    
    trackEditorBtn.addEventListener('click', () => {
        alert('Track editor mode coming soon!');
    });
    
    customizeBtn.addEventListener('click', () => {
        alert('Car customization coming soon!');
    });
    
    // Back button
    backBtn.addEventListener('click', () => {
        singlePlayerScreen.classList.remove('active');
        mainMenu.classList.add('active');
    });
    
    // Track selection
    trackOptions.forEach(option => {
        option.addEventListener('click', () => {
            trackOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedTrack = option.dataset.track;
        });
    });
    
    // Start race
    startRaceBtn.addEventListener('click', () => {
        alert(`Starting race on ${selectedTrack.replace('-', ' ').toUpperCase()} track!`);
        // In a full implementation, this would launch the game
        // initGame(selectedTrack);
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && singlePlayerScreen.classList.contains('active')) {
            singlePlayerScreen.classList.remove('active');
            mainMenu.classList.add('active');
        }
    });
    
    // Preload hover sounds
    const hoverSound = new Audio('assets/audio/hover.wav');
    hoverSound.volume = 0.2;
    
    document.querySelectorAll('.menu-btn, .track-option, .start-btn').forEach(el => {
        el.addEventListener('mouseenter', () => {
            hoverSound.currentTime = 0;
            hoverSound.play();
        });
    });
});
