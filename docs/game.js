/**
 * Pop! Bolhas - Main Game Logic
 * A satisfying bubble popping game with rhythm mechanics
 */

class PopBubblesGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.dpr = window.devicePixelRatio || 1;
        
        // Game state
        this.gameState = 'menu'; // menu, running, paused, gameOver
        this.difficulty = 'easy';
        this.score = 0;
        this.combo = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.lives = 3;
        this.maxLives = 3;
        this.highScore = parseInt(localStorage.getItem('popBubblesHighScore') || '0');
        this.lastPopTime = 0;
        this.timeScale = 1;
        this.slowMoEndTime = 0;
        
        // Settings
        this.isMuted = false;
        this.comboWindow = 800; // ms
        this.comboTargets = [8, 14, 20, 30]; // Slow-mo triggers
        
        // Difficulty settings
        this.difficultySettings = {
            easy: {
                name: 'Easy',
                spawnRate: 1500, // ms between spawns
                maxBubbles: 25,
                bubbleSizeMin: 35,
                bubbleSizeMax: 65,
                bubbleSpeed: 20,
                penaltyPoints: 5
            },
            medium: {
                name: 'Medium',
                spawnRate: 1000,
                maxBubbles: 35,
                bubbleSizeMin: 25,
                bubbleSizeMax: 50,
                bubbleSpeed: 30,
                penaltyPoints: 10
            },
            hard: {
                name: 'Hard',
                spawnRate: 500,
                maxBubbles: 55,
                bubbleSizeMin: 30,
                bubbleSizeMax: 100,
                bubbleSpeed: 55,
                penaltyPoints: 20
            },
            pro: {
                name: 'Pro',
                spawnRate: 200,
                maxBubbles: 100,
                bubbleSizeMin: 20,
                bubbleSizeMax: 60,
                bubbleSpeed: 90,
                penaltyPoints: 30
            },
            custom: {
                name: 'Custom',
                spawnRate: 1000,
                maxBubbles: 35,
                bubbleSizeMin: 25,
                bubbleSizeMax: 50,
                bubbleSpeed: 30,
                penaltyPoints: 10
            }
        };
        
        // Game objects
        this.bubbles = [];
        this.particles = [];
        this.nextBubbleId = 0;
        this.lastSpawnTime = 0;
        this.spawnRate = this.difficultySettings[this.difficulty].spawnRate;
        this.maxBubbles = this.difficultySettings[this.difficulty].maxBubbles;
        
        // Input handling
        this.pointerCooldowns = new Map();
        this.pointerCooldownTime = 100; // ms
        
        // Performance
        this.lastFrameTime = 0;
        this.fps = 0;
        this.frameCount = 0;
        this.fpsUpdateTime = 0;
        this.showFPS = this.getDevModeFromURL();
        
        // UI elements
        this.difficultyScreen = document.getElementById('difficultyScreen');
        this.ui = document.getElementById('ui');
        this.scoreEl = document.getElementById('score');
        this.comboEl = document.getElementById('combo');
        this.streakEl = document.getElementById('streak');
        this.highScoreEl = document.getElementById('highScore');
        this.difficultyEl = document.getElementById('difficulty');
        this.customSettings = document.getElementById('customSettings');
        this.startCustomGameBtn = document.getElementById('startCustomGame');
        this.muteBtn = document.getElementById('muteBtn');
        this.perfectFeedback = document.getElementById('perfectFeedback');
        this.missFeedback = document.getElementById('missFeedback');
        this.missClickFeedback = document.getElementById('missClickFeedback');
        this.penaltyFeedback = document.getElementById('penaltyFeedback');
        this.comboFeedback = document.getElementById('comboFeedback');
        this.streakFeedback = document.getElementById('streakFeedback');
        this.livesEl = document.getElementById('lives');
        this.gameOverOverlay = document.getElementById('gameOverOverlay');
        this.finalScoreEl = document.getElementById('finalScore');
        this.finalHighScoreEl = document.getElementById('finalHighScore');
        this.finalMaxStreakEl = document.getElementById('finalMaxStreak');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.hints = document.getElementById('hints');
        this.pauseOverlay = document.getElementById('pauseOverlay');
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.setupDifficultySelection();
        this.updateUI();
        this.gameLoop();
        
        // Add play again button listener after DOM is ready
        if (this.playAgainBtn) {
            // Remove any existing listeners first
            this.playAgainBtn.removeEventListener('click', this.playAgainHandler);
            this.playAgainHandler = () => this.playAgain();
            this.playAgainBtn.addEventListener('click', this.playAgainHandler);
        }
        
        // Initialize audio on first interaction
        document.addEventListener('pointerdown', () => {
            if (!window.audioSystem.initialized) {
                window.audioSystem.init();
            }
        }, { once: true });
        
        // Also initialize on first click on canvas
        this.canvas.addEventListener('pointerdown', () => {
            if (!window.audioSystem.initialized) {
                window.audioSystem.init();
            }
        }, { once: true });
    }
    
    setupCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * this.dpr;
        this.canvas.height = rect.height * this.dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        this.ctx.scale(this.dpr, this.dpr);
        this.canvasWidth = rect.width;
        this.canvasHeight = rect.height;
    }
    
    setupEventListeners() {
        // Pointer events for bubble popping
        this.canvas.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Touch start detected');
            if (e.touches.length > 0) {
                this.handlePointerDown(e.touches[0]);
            }
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, { passive: false });
        
        // Mouse events as fallback
        this.canvas.addEventListener('mousedown', (e) => this.handlePointerDown(e));
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // UI buttons
        this.muteBtn.addEventListener('click', () => this.toggleMute());
        
        // Prevent context menu and scrolling
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    }
    
    setupDifficultySelection() {
        const difficultyBtns = document.querySelectorAll('.difficulty-btn');
        difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const difficulty = btn.dataset.difficulty;
                if (difficulty === 'custom') {
                    this.showCustomSettings();
                } else {
                    this.startGame(difficulty);
                }
            });
        });
        
        // Setup custom settings
        this.setupCustomSettings();
    }
    
    setupCustomSettings() {
        // Get slider elements
        const sliders = {
            spawnRate: document.getElementById('spawnRateSlider'),
            maxBubbles: document.getElementById('maxBubblesSlider'),
            sizeMin: document.getElementById('sizeMinSlider'),
            sizeMax: document.getElementById('sizeMaxSlider'),
            speed: document.getElementById('speedSlider'),
            penalty: document.getElementById('penaltySlider')
        };
        
        // Get value display elements
        const values = {
            spawnRate: document.getElementById('spawnRateValue'),
            maxBubbles: document.getElementById('maxBubblesValue'),
            sizeMin: document.getElementById('sizeMinValue'),
            sizeMax: document.getElementById('sizeMaxValue'),
            speed: document.getElementById('speedValue'),
            penalty: document.getElementById('penaltyValue')
        };
        
        // Update values when sliders change
        Object.keys(sliders).forEach(key => {
            if (sliders[key] && values[key]) {
                sliders[key].addEventListener('input', () => {
                    values[key].textContent = sliders[key].value;
                });
            }
        });
        
        // Start custom game button
        if (this.startCustomGameBtn) {
            this.startCustomGameBtn.addEventListener('click', () => {
                this.startCustomGame();
            });
        }
    }
    
    showCustomSettings() {
        this.customSettings.classList.remove('hidden');
    }
    
    startCustomGame() {
        // Get values from sliders
        const customSettings = {
            spawnRate: parseInt(document.getElementById('spawnRateSlider').value),
            maxBubbles: parseInt(document.getElementById('maxBubblesSlider').value),
            bubbleSizeMin: parseInt(document.getElementById('sizeMinSlider').value),
            bubbleSizeMax: parseInt(document.getElementById('sizeMaxSlider').value),
            bubbleSpeed: parseInt(document.getElementById('speedSlider').value),
            penaltyPoints: parseInt(document.getElementById('penaltySlider').value)
        };
        
        // Update custom difficulty settings
        this.difficultySettings.custom = {
            name: 'Custom',
            ...customSettings
        };
        
        // Start game with custom settings
        this.startGame('custom');
    }
    
    startGame(difficulty) {
        this.difficulty = difficulty;
        this.applyDifficultySettings();
        
        // Hide difficulty screen and custom settings, show game UI
        this.difficultyScreen.classList.add('hidden');
        this.customSettings.classList.add('hidden');
        this.ui.classList.remove('hidden');
        
        // Reset game state
        this.gameState = 'running';
        this.score = 0;
        this.combo = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.lives = this.maxLives;
        this.bubbles = [];
        this.particles = [];
        this.timeScale = 1;
        this.slowMoEndTime = 0;
        
        this.updateUI();
    }
    
    applyDifficultySettings() {
        const settings = this.difficultySettings[this.difficulty];
        this.spawnRate = settings.spawnRate;
        this.maxBubbles = settings.maxBubbles;
        this.difficultyEl.textContent = settings.name;
    }
    
    handlePointerDown(e) {
        console.log('Pointer down event:', e.type, 'Game state:', this.gameState);
        
        if (this.gameState !== 'running') {
            console.log('Game not running, ignoring touch');
            return;
        }
        
        // Check if the click is on a UI element (not on canvas)
        if (e.target !== this.canvas) {
            console.log('Touch not on canvas, ignoring');
            return;
        }
        
        const pointerId = e.pointerId || e.identifier || 'mouse';
        const now = Date.now();
        
        // Cooldown to prevent ghost clicks
        if (this.pointerCooldowns.has(pointerId) && 
            now - this.pointerCooldowns.get(pointerId) < this.pointerCooldownTime) {
            console.log('Touch cooldown active');
            return;
        }
        
        this.pointerCooldowns.set(pointerId, now);
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        console.log('Touch coordinates:', x, y);
        this.popBubbleAt(x, y);
    }
    
    handleKeyDown(e) {
        switch(e.key.toLowerCase()) {
            case 'm':
                this.toggleMute();
                break;
            case 'p':
                this.togglePause();
                break;
            case 'r':
                this.restart();
                break;
        }
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        window.audioSystem.setMuted(this.isMuted);
        this.muteBtn.textContent = this.isMuted ? '🔇' : '🔈';
    }
    
    togglePause() {
        if (this.gameState === 'running') {
            this.gameState = 'paused';
            this.pauseOverlay.classList.remove('hidden');
        } else if (this.gameState === 'paused') {
            this.gameState = 'running';
            this.pauseOverlay.classList.add('hidden');
        }
    }
    
    restart() {
        // Show difficulty selection screen
        this.difficultyScreen.classList.remove('hidden');
        this.customSettings.classList.add('hidden');
        this.ui.classList.add('hidden');
        this.gameState = 'menu';
        this.pauseOverlay.classList.add('hidden');
    }
    
    popBubbleAt(x, y) {
        let popped = false;
        let bubbleToPop = null;
        
        // Find bubble to pop (check from front to back)
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const bubble = this.bubbles[i];
            const distance = Math.sqrt((x - bubble.x) ** 2 + (y - bubble.y) ** 2);
            
            if (distance <= bubble.r) {
                bubbleToPop = bubble;
                this.bubbles.splice(i, 1);
                popped = true;
                break;
            }
        }
        
        if (!popped) {
            // Missed - apply penalty and show feedback
            this.applyPenalty();
            this.showMissClickFeedback();
            return;
        }
        
        const now = Date.now();
        const isInComboWindow = now - this.lastPopTime <= this.comboWindow;
        
        // Calculate score
        let baseScore = Math.round((100 / bubbleToPop.r) * 10);
        baseScore = Math.max(10, Math.min(60, baseScore)); // Clamp between 10-60
        
        if (isInComboWindow) {
            this.combo++;
            this.streak++;
            this.maxStreak = Math.max(this.maxStreak, this.streak);
            
            const comboMultiplier = 1 + 0.2 * (this.combo - 1);
            const streakMultiplier = 1 + (this.streak * 0.05); // 5% bonus per streak
            baseScore = Math.round(baseScore * Math.min(comboMultiplier, 4) * streakMultiplier);
            
            // Show combo feedback for certain milestones
            if (this.combo === 3 || this.combo === 5 || this.combo === 10) {
                this.showComboFeedback();
            }
            
            // Show streak feedback for high streaks
            if (this.streak >= 10 && this.streak % 5 === 0) {
                this.showStreakFeedback();
            }
        } else {
            this.combo = 1;
            // Don't reset streak here - streak only resets on penalty
            this.streak++;
            this.maxStreak = Math.max(this.maxStreak, this.streak);
        }
        
        this.score += baseScore;
        this.lastPopTime = now;
        
        // Check for slow-mo trigger
        if (this.comboTargets.includes(this.combo)) {
            this.triggerSlowMo();
        }
        
        // Create particles
        this.createPopParticles(bubbleToPop.x, bubbleToPop.y, bubbleToPop.r);
        
        // Play sound
        const velocity = Math.min(1, bubbleToPop.r / 30);
        const pitchHint = Math.min(1, (60 - bubbleToPop.r) / 40);
        window.audioSystem.playPop(velocity, pitchHint, false);
        
        // Update UI
        this.updateUI();
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('popBubblesHighScore', this.highScore.toString());
            this.updateUI();
        }
    }
    
    
    triggerSlowMo() {
        this.timeScale = 0.5;
        this.slowMoEndTime = Date.now() + 700;
        window.audioSystem.playSlowMo();
    }
    
    createPopParticles(x, y, radius) {
        // Ripple effect
        this.particles.push({
            type: 'ripple',
            x, y,
            radius: 0,
            maxRadius: radius * 3,
            alpha: 0.8,
            life: 0.6,
            maxLife: 0.6
        });
        
        // Shard particles
        const shardCount = 8 + Math.floor(Math.random() * 7);
        for (let i = 0; i < shardCount; i++) {
            const angle = (Math.PI * 2 * i) / shardCount + Math.random() * 0.5;
            const speed = 50 + Math.random() * 100;
            
            this.particles.push({
                type: 'shard',
                id: i,
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 50,
                size: 2 + Math.random() * 3,
                alpha: 1,
                life: 1,
                maxLife: 1,
                gravity: 200
            });
        }
    }
    
    spawnBubble() {
        if (this.bubbles.length >= this.maxBubbles) return;
        
        const settings = this.difficultySettings[this.difficulty];
        const radius = settings.bubbleSizeMin + Math.random() * (settings.bubbleSizeMax - settings.bubbleSizeMin);
        const x = radius + Math.random() * (this.canvasWidth - radius * 2);
        const y = this.canvasHeight + radius;
        
        this.bubbles.push({
            id: this.nextBubbleId++,
            x, y,
            r: radius,
            vx: (Math.random() - 0.5) * 20, // Horizontal drift
            vy: -settings.bubbleSpeed - Math.random() * 10, // Upward movement
            bornAt: Date.now(),
            life: 1
        });
    }
    
    updateBubbles(deltaTime) {
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const bubble = this.bubbles[i];
            
            // Update position
            bubble.x += bubble.vx * deltaTime * this.timeScale;
            bubble.y += bubble.vy * deltaTime * this.timeScale;
            
            // Add slight floating motion
            bubble.x += Math.sin(Date.now() * 0.001 + bubble.id) * 0.5;
            
            // Remove if out of bounds
            if (bubble.y < -bubble.r || 
                bubble.x < -bubble.r || 
                bubble.x > this.canvasWidth + bubble.r) {
                
                // Apply penalty for bubbles that escape
                if (bubble.y < -bubble.r) {
                    this.applyPenalty();
                }
                
                this.bubbles.splice(i, 1);
            }
        }
    }
    
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            if (particle.type === 'ripple') {
                particle.radius += 200 * deltaTime * this.timeScale;
                particle.alpha = particle.alpha * (1 - deltaTime * 2);
            } else if (particle.type === 'shard') {
                particle.x += particle.vx * deltaTime * this.timeScale;
                particle.y += particle.vy * deltaTime * this.timeScale;
                particle.vy += particle.gravity * deltaTime * this.timeScale;
                particle.alpha = particle.life / particle.maxLife;
            }
            
            particle.life -= deltaTime * this.timeScale;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    updateSlowMo() {
        if (this.timeScale < 1 && Date.now() >= this.slowMoEndTime) {
            this.timeScale = Math.min(1, this.timeScale + 0.02);
        }
    }
    
    drawBubble(bubble) {
        // Create colorful gradient based on bubble size
        const colors = [
            ['#ff6b6b', '#4ecdc4', '#45b7d1'],
            ['#96ceb4', '#feca57', '#ff9ff3'],
            ['#54a0ff', '#5f27cd', '#00d2d3'],
            ['#ff9f43', '#ee5a24', '#0984e3']
        ];
        
        const colorSet = colors[bubble.id % colors.length];
        const gradient = this.ctx.createRadialGradient(
            bubble.x, bubble.y - bubble.r * 0.3, 0,
            bubble.x, bubble.y, bubble.r
        );
        
        gradient.addColorStop(0, `rgba(255, 255, 255, 0.9)`);
        gradient.addColorStop(0.2, `${colorSet[0]}80`);
        gradient.addColorStop(0.5, `${colorSet[1]}60`);
        gradient.addColorStop(0.8, `${colorSet[2]}40`);
        gradient.addColorStop(1, `${colorSet[0]}20`);
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(bubble.x, bubble.y, bubble.r, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Outer glow
        this.ctx.shadowColor = colorSet[0];
        this.ctx.shadowBlur = 15;
        this.ctx.strokeStyle = `${colorSet[0]}40`;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(bubble.x, bubble.y, bubble.r, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
        
        // Highlight
        const highlightGradient = this.ctx.createRadialGradient(
            bubble.x - bubble.r * 0.3, bubble.y - bubble.r * 0.3, 0,
            bubble.x - bubble.r * 0.3, bubble.y - bubble.r * 0.3, bubble.r * 0.4
        );
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        this.ctx.fillStyle = highlightGradient;
        this.ctx.beginPath();
        this.ctx.arc(bubble.x - bubble.r * 0.3, bubble.y - bubble.r * 0.3, bubble.r * 0.4, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawParticle(particle) {
        if (particle.type === 'ripple') {
            const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
            const color = colors[Math.floor(particle.radius / 20) % colors.length];
            
            this.ctx.strokeStyle = `${color}${Math.floor(particle.alpha * 255).toString(16).padStart(2, '0')}`;
            this.ctx.lineWidth = 3;
            this.ctx.shadowColor = color;
            this.ctx.shadowBlur = 10;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;
        } else if (particle.type === 'shard') {
            const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
            const color = colors[particle.id % colors.length];
            
            this.ctx.fillStyle = `${color}${Math.floor(particle.alpha * 255).toString(16).padStart(2, '0')}`;
            this.ctx.shadowColor = color;
            this.ctx.shadowBlur = 8;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = 'transparent';
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // Draw bubbles
        this.bubbles.forEach(bubble => this.drawBubble(bubble));
        
        // Draw particles
        this.particles.forEach(particle => this.drawParticle(particle));
        
        // Draw slow-mo vignette
        if (this.timeScale < 1) {
            const vignetteAlpha = (1 - this.timeScale) * 0.3;
            this.ctx.fillStyle = `rgba(0, 0, 0, ${vignetteAlpha})`;
            this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        }
        
        // Draw FPS (dev mode)
        if (this.showFPS) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            this.ctx.font = '14px monospace';
            this.ctx.fillText(`FPS: ${this.fps}`, 10, this.canvasHeight - 10);
        }
    }
    
    updateUI() {
        this.scoreEl.textContent = this.score.toLocaleString();
        this.highScoreEl.textContent = `High Score: ${this.highScore.toLocaleString()}`;
        
        // Update lives display
        this.livesEl.textContent = '❤️'.repeat(this.lives) + '🤍'.repeat(this.maxLives - this.lives);
        
        if (this.combo > 1) {
            this.comboEl.textContent = `x${this.combo}`;
            this.comboEl.classList.remove('hidden');
            this.comboEl.classList.add('show');
        } else {
            this.comboEl.classList.add('hidden');
        }
        
        if (this.streak > 1) {
            this.streakEl.textContent = `Streak: ${this.streak}`;
            this.streakEl.classList.remove('hidden');
            this.streakEl.classList.add('show');
        } else {
            this.streakEl.classList.add('hidden');
        }
    }
    
    
    showMissFeedback() {
        this.missFeedback.classList.remove('hidden');
        setTimeout(() => {
            this.missFeedback.classList.add('hidden');
        }, 600);
    }
    
    showMissClickFeedback() {
        this.missClickFeedback.classList.remove('hidden');
        setTimeout(() => {
            this.missClickFeedback.classList.add('hidden');
        }, 500);
    }
    
    applyPenalty() {
        this.lives--;
        this.combo = 0; // Reset combo on penalty
        this.streak = 0; // Reset streak on penalty
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.showPenaltyFeedback('💔');
            this.updateUI();
        }
    }
    
    showPenaltyFeedback(penalty) {
        this.penaltyFeedback.textContent = penalty;
        this.penaltyFeedback.classList.remove('hidden');
        setTimeout(() => {
            this.penaltyFeedback.classList.add('hidden');
        }, 800);
    }
    
    showComboFeedback() {
        this.comboFeedback.classList.remove('hidden');
        setTimeout(() => {
            this.comboFeedback.classList.add('hidden');
        }, 1000);
    }
    
    showStreakFeedback() {
        this.streakFeedback.textContent = `Streak ${this.streak}!`;
        this.streakFeedback.classList.remove('hidden');
        setTimeout(() => {
            this.streakFeedback.classList.add('hidden');
        }, 1200);
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        this.finalScoreEl.textContent = this.score.toLocaleString();
        this.finalHighScoreEl.textContent = this.highScore.toLocaleString();
        this.finalMaxStreakEl.textContent = this.maxStreak;
        this.gameOverOverlay.classList.remove('hidden');
        
        // Play game over sound
        if (!this.isMuted) {
            window.audioSystem.playGameOver();
        }
    }
    
    playAgain() {
        this.gameOverOverlay.classList.add('hidden');
        this.difficultyScreen.classList.remove('hidden');
        this.ui.classList.add('hidden');
        this.gameState = 'menu';
    }
    
    updateFPS(currentTime) {
        this.frameCount++;
        if (currentTime - this.fpsUpdateTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.fpsUpdateTime));
            this.frameCount = 0;
            this.fpsUpdateTime = currentTime;
        }
    }
    
    
    getDevModeFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('dev') === '1';
    }
    
    gameLoop(currentTime = 0) {
        // Calculate delta time
        const deltaTime = this.lastFrameTime ? (currentTime - this.lastFrameTime) / 1000 : 0;
        this.lastFrameTime = currentTime;
        
        // Update FPS counter
        this.updateFPS(currentTime);
        
        if (this.gameState === 'running') {
            // Spawn bubbles
            if (currentTime - this.lastSpawnTime >= this.spawnRate) {
                this.spawnBubble();
                this.lastSpawnTime = currentTime;
                // Add some randomness to spawn rate
                const settings = this.difficultySettings[this.difficulty];
                this.spawnRate = settings.spawnRate + Math.random() * 200;
            }
            
            // Update game objects
            this.updateBubbles(deltaTime);
            this.updateParticles(deltaTime);
            this.updateSlowMo();
        }
        
        // Draw everything
        this.draw();
        
        // Continue loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Start the game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new PopBubblesGame();
});
