class AssetPreloader {
    constructor() {
        this.manifest = {
            audio: [
                { id: 'menu-music', src: 'audio/menu.mp3' },
                { id: 'click-sound', src: 'audio/click.mp3' },
                { id: 'hover-sound', src: 'audio/hover.mp3' },
                { id: 'engine-sound', src: 'audio/engine.mp3' },
                { id: 'nitro-sound', src: 'audio/nitro.mp3' },
                { id: 'rewind-sound', src: 'audio/time.mp3' }
            ],
            images: [
                // Tracks
                { id: 'track-1', src: 'assets/track1.png' },
                { id: 'track-2', src: 'assets/track2.png' },
                { id: 'track-3', src: 'assets/track3.png' },
                
                // Backgrounds
                { id: 'stars-bg', src: 'assetsimages/stars.png' },
                { id: 'twinkling-bg', src: 'assetsimages/twinkling.png' },
                
                // Cars
                { id: 'car-player', src: 'cars/player.png' },
                { id: 'car-ai1', src: 'cars/ai1.png' },
                { id: 'car-ai2', src: 'cars/ai2.png' }
            ]
        };

        this.loadedAssets = 0;
        this.totalAssets = Object.values(this.manifest).reduce((total, arr) => total + arr.length, 0);
        this.initLoadingScreen();
    }

    initLoadingScreen() {
        document.getElementById('preloader-screen').innerHTML = `
            <div class="preloader-container">
                <div class="logo-glitch">QUANTUM RACER</div>
                <div class="progress-container">
                    <div class="progress-bar"></div>
                    <div class="progress-text">LOADING: 0%</div>
                </div>
                <div class="asset-status">Initializing chrono drive...</div>
            </div>
        `;
    }

    async loadAll() {
        const loaders = [
            this.loadAudio(),
            this.loadImages()
        ];

        await Promise.all(loaders);
        this.completeLoading();
    }

    async loadAudio() {
        for (const audio of this.manifest.audio) {
            try {
                await new Promise((resolve) => {
                    const audioEl = new Audio();
                    audioEl.src = audio.src;
                    audioEl.preload = "auto";
                    audioEl.oncanplaythrough = () => {
                        this.updateProgress(audio.id);
                        resolve();
                    };
                    audioEl.onerror = () => {
                        console.warn(`Failed to load audio: ${audio.src}`);
                        resolve();
                    };
                });
            } catch (e) {
                console.error(`Error loading ${audio.id}:`, e);
            }
        }
    }

    async loadImages() {
        for (const img of this.manifest.images) {
            try {
                await new Promise((resolve) => {
                    const image = new Image();
                    image.src = img.src;
                    image.onload = () => {
                        this.updateProgress(img.id);
                        resolve();
                    };
                    image.onerror = () => {
                        console.warn(`Failed to load image: ${img.src}`);
                        resolve();
                    };
                });
            } catch (e) {
                console.error(`Error loading ${img.id}:`, e);
            }
        }
    }

    updateProgress(assetId) {
        this.loadedAssets++;
        const percent = Math.floor((this.loadedAssets / this.totalAssets) * 100);
        
        const progressBar = document.querySelector('.progress-bar');
        const progressText = document.querySelector('.progress-text');
        const assetStatus = document.querySelector('.asset-status');
        
        progressBar.style.width = `${percent}%`;
        progressText.textContent = `LOADING: ${percent}%`;
        assetStatus.textContent = this.getStatusMessage(assetId);
    }

    getStatusMessage(assetId) {
        const messages = {
            'menu-music': "Tuning quantum radio...",
            'engine-sound': "Calibrating hyperdrive...",
            'car-player': "Painting player chassis...",
            'track-1': "Rendering Neo Tokyo track...",
            default: `Loading ${assetId.replace('-', ' ')}...`
        };
        return messages[assetId] || messages.default;
    }

    completeLoading() {
        const preloader = document.getElementById('preloader-screen');
        preloader.style.opacity = '0';
        
        setTimeout(() => {
            preloader.remove();
            document.getElementById('game-container').style.display = 'block';
            document.dispatchEvent(new CustomEvent('assetsLoaded'));
        }, 500);
    }
}

// Start preloading when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const preloader = new AssetPreloader();
    preloader.loadAll().catch(console.error);
});
