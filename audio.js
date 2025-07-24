class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.musicVolume = 0.5;
        this.sfxVolume = 0.7;
        this.muted = false;
        
        this.loadSounds();
    }
    
    loadSounds() {
        // In a real implementation, these would load actual files
        this.sounds = {
            'engine': this.createDummySound('engine'),
            'skid': this.createDummySound('skid'),
            'crash': this.createDummySound('crash'),
            'nitro': this.createDummySound('nitro'),
            'time-rewind': this.createDummySound('time-rewind'),
            'checkpoint': this.createDummySound('checkpoint')
        };
        
        this.music = this.createDummySound('music');
    }
    
    createDummySound(name) {
        // This is a placeholder - in a real game you'd use the Web Audio API
        return {
            play: () => console.log(`Playing sound: ${name}`),
            stop: () => console.log(`Stopping sound: ${name}`),
            loop: (shouldLoop) => console.log(`${name} loop: ${shouldLoop}`)
        };
    }
    
    play(soundName, options = {}) {
        if (this.muted || !this.sounds[soundName]) return;
        
        const sound = this.sounds[soundName];
        sound.loop(!!options.loop);
        
        // In a real implementation, we'd set volume and playback rate
        sound.play();
    }
    
    stop(soundName) {
        if (!this.sounds[soundName]) return;
        this.sounds[soundName].stop();
    }
    
    playMusic(trackName) {
        if (this.muted) return;
        
        this.stopMusic();
        this.music.loop(true);
        this.music.play();
    }
    
    stopMusic() {
        this.music.stop();
    }
    
    toggleMute() {
        this.muted = !this.muted;
        if (this.muted) {
            this.stopMusic();
        } else {
            this.playMusic('main');
        }
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        // In real implementation, apply to music gain node
    }
    
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        // In real implementation, apply to SFX gain node
    }
}
