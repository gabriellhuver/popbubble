/**
 * Audio system for Pop! Bolhas
 * Uses WebAudio API for procedural sound generation
 */

class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.isMuted = false;
        this.isInitialized = false;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        
        try {
            // Create audio context on first user interaction
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = 0.7; // Master volume
            
            // Resume context if suspended (required for some browsers)
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            this.isInitialized = true;
            this.initialized = true;
            
            console.log('✅ Audio system initialized successfully');
        } catch (error) {
            console.warn('❌ Audio initialization failed:', error);
            this.isInitialized = false;
            this.initialized = false;
        }
    }

    setMuted(muted) {
        this.isMuted = muted;
        if (this.masterGain) {
            this.masterGain.gain.value = muted ? 0 : 0.7;
        }
    }

    async playPop(velocity = 1, pitchHint = 0.5, isPerfect = false) {
        if (!this.isInitialized || this.isMuted || !this.audioContext) return;

        try {
            // Resume context if suspended
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            const now = this.audioContext.currentTime;
            const duration = 0.15 + Math.random() * 0.1; // 0.15-0.25s
            
            // Base frequency with variation
            const baseFreq = 300 + pitchHint * 400; // 300-700 Hz
            const freq = baseFreq + (Math.random() - 0.5) * 100;
            
            // Create oscillator for tone
            const oscillator = this.audioContext.createOscillator();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(freq, now);
            
            // Create noise for pop effect
            const bufferSize = this.audioContext.sampleRate * duration;
            const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const noiseData = noiseBuffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
                noiseData[i] = (Math.random() * 2 - 1) * 0.3;
            }
            
            const noiseSource = this.audioContext.createBufferSource();
            noiseSource.buffer = noiseBuffer;
            
            // Create gain nodes for envelope
            const toneGain = this.audioContext.createGain();
            const noiseGain = this.audioContext.createGain();
            
            // ADSR envelope
            const attackTime = 0.01;
            const decayTime = 0.05;
            const sustainLevel = 0.3 + velocity * 0.4;
            const releaseTime = duration - attackTime - decayTime;
            
            // Tone envelope
            toneGain.gain.setValueAtTime(0, now);
            toneGain.gain.linearRampToValueAtTime(sustainLevel, now + attackTime);
            toneGain.gain.linearRampToValueAtTime(sustainLevel * 0.7, now + attackTime + decayTime);
            toneGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
            
            // Noise envelope (shorter)
            const noiseDuration = duration * 0.6;
            noiseGain.gain.setValueAtTime(0, now);
            noiseGain.gain.linearRampToValueAtTime(0.2 + velocity * 0.3, now + attackTime);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + noiseDuration);
            
            // Perfect hit gets extra sparkle
            if (isPerfect) {
                const sparkleOsc = this.audioContext.createOscillator();
                sparkleOsc.type = 'sine';
                sparkleOsc.frequency.setValueAtTime(freq * 2.5, now);
                
                const sparkleGain = this.audioContext.createGain();
                sparkleGain.gain.setValueAtTime(0, now);
                sparkleGain.gain.linearRampToValueAtTime(0.1, now + 0.02);
                sparkleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                
                sparkleOsc.connect(sparkleGain);
                sparkleGain.connect(this.masterGain);
                sparkleOsc.start(now);
                sparkleOsc.stop(now + 0.1);
            }
            
            // Connect nodes
            oscillator.connect(toneGain);
            toneGain.connect(this.masterGain);
            
            noiseSource.connect(noiseGain);
            noiseGain.connect(this.masterGain);
            
            // Start sounds
            oscillator.start(now);
            oscillator.stop(now + duration);
            
            noiseSource.start(now);
            noiseSource.stop(now + noiseDuration);
            
        } catch (error) {
            console.warn('Audio playback failed:', error);
        }
    }

    async playMiss() {
        if (!this.isInitialized || this.isMuted || !this.audioContext) return;

        try {
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            const now = this.audioContext.currentTime;
            const duration = 0.2;
            
            // Low frequency "thud" for miss
            const oscillator = this.audioContext.createOscillator();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(120, now);
            oscillator.frequency.exponentialRampToValueAtTime(80, now + duration);
            
            const gain = this.audioContext.createGain();
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
            
            oscillator.connect(gain);
            gain.connect(this.masterGain);
            
            oscillator.start(now);
            oscillator.stop(now + duration);
            
        } catch (error) {
            console.warn('Miss sound failed:', error);
        }
    }

    async playSlowMo() {
        if (!this.isInitialized || this.isMuted || !this.audioContext) return;

        try {
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            const now = this.audioContext.currentTime;
            const duration = 0.7;
            
            // Slow motion "whoosh" effect
            const oscillator = this.audioContext.createOscillator();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(200, now);
            oscillator.frequency.exponentialRampToValueAtTime(50, now + duration);
            
            const gain = this.audioContext.createGain();
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.15, now + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
            
            // Add some reverb-like effect
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1000, now);
            filter.frequency.exponentialRampToValueAtTime(200, now + duration);
            
            oscillator.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);
            
            oscillator.start(now);
            oscillator.stop(now + duration);
            
        } catch (error) {
            console.warn('Slow-mo sound failed:', error);
        }
    }

    async playLifeLost() {
        if (!this.isInitialized || this.isMuted || !this.audioContext) return;

        try {
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            const now = this.audioContext.currentTime;
            const duration = 0.8;
            
            // Life lost sound - descending "heartbeat" effect
            const oscillator = this.audioContext.createOscillator();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(200, now);
            oscillator.frequency.exponentialRampToValueAtTime(80, now + duration);
            
            const gain = this.audioContext.createGain();
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
            gain.gain.linearRampToValueAtTime(0.1, now + 0.3);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
            
            // Add a second oscillator for "heartbeat" effect
            const heartbeat = this.audioContext.createOscillator();
            heartbeat.type = 'sine';
            heartbeat.frequency.setValueAtTime(150, now);
            heartbeat.frequency.exponentialRampToValueAtTime(60, now + duration);
            
            const heartbeatGain = this.audioContext.createGain();
            heartbeatGain.gain.setValueAtTime(0, now);
            heartbeatGain.gain.linearRampToValueAtTime(0.08, now + 0.1);
            heartbeatGain.gain.linearRampToValueAtTime(0.05, now + 0.4);
            heartbeatGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
            
            // Add some reverb-like effect
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, now);
            filter.frequency.exponentialRampToValueAtTime(200, now + duration);
            
            oscillator.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);
            
            heartbeat.connect(heartbeatGain);
            heartbeatGain.connect(this.masterGain);
            
            oscillator.start(now);
            heartbeat.start(now);
            oscillator.stop(now + duration);
            heartbeat.stop(now + duration);
            
        } catch (error) {
            console.warn('Life lost sound failed:', error);
        }
    }

    async playGameOver() {
        if (!this.isInitialized || this.isMuted || !this.audioContext) return;

        try {
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            const now = this.audioContext.currentTime;
            const duration = 2.0;
            
            // Game over sound - descending tone
            const oscillator = this.audioContext.createOscillator();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(300, now);
            oscillator.frequency.exponentialRampToValueAtTime(100, now + duration);
            
            const gain = this.audioContext.createGain();
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
            
            // Add some vibrato
            const vibrato = this.audioContext.createOscillator();
            vibrato.type = 'sine';
            vibrato.frequency.setValueAtTime(5, now);
            
            const vibratoGain = this.audioContext.createGain();
            vibratoGain.gain.setValueAtTime(10, now);
            
            vibrato.connect(vibratoGain);
            vibratoGain.connect(oscillator.frequency);
            
            oscillator.connect(gain);
            gain.connect(this.masterGain);
            
            oscillator.start(now);
            vibrato.start(now);
            oscillator.stop(now + duration);
            vibrato.stop(now + duration);
            
        } catch (error) {
            console.warn('Game over sound failed:', error);
        }
    }
}

// Global audio instance
window.audioSystem = new AudioSystem();
