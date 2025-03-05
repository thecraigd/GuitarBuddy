// Debug helper - add to window object for access from console
function debugLog(message) {
  console.log(`[Metronome] ${message}`);
  if (window.debugElements && window.debugElements.metronomeOutput) {
    const debugOutput = window.debugElements.metronomeOutput;
    debugOutput.textContent += message + '\n';
    debugOutput.scrollTop = debugOutput.scrollHeight;
  }
}

// Metronome module - completely rewritten for reliability
class Metronome {
  constructor() {
    debugLog('Initializing metronome module');
    
    // Core state
    this.audioContext = null;
    this.tempo = 120;
    this.beatsPerMeasure = 4;
    this.isPlaying = false;
    this.currentBeat = 0;
    this.intervalID = null;
    
    // Track UI elements initialization status
    this.uiInitialized = false;
    
    // DOM initialization should be deferred
    this.initUI();
  }
  
  initUI() {
    try {
      debugLog('Setting up metronome UI');
      // These will be null if metronome section is not visible yet
      this.tempoDisplay = document.querySelector('.tempo-display');
      this.tempoSlider = document.getElementById('tempo-slider');
      this.beatsSelect = document.getElementById('beats-per-measure');
      this.startButton = document.getElementById('start-metronome');
      this.tempoUpButton = document.getElementById('tempo-up');
      this.tempoDownButton = document.getElementById('tempo-down');
      
      // Check if UI elements are available
      if (!this.tempoDisplay || !this.tempoSlider || !this.startButton) {
        debugLog('UI elements not ready, will retry');
        setTimeout(() => this.initUI(), 100); // retry after a delay
        return;
      }
      
      // UI is ready, add event listeners
      debugLog('UI elements found, adding event listeners');
      this.startButton.addEventListener('click', () => {
        debugLog('Start/stop button clicked');
        this.toggleMetronome();
      });
      
      this.tempoSlider.addEventListener('input', () => {
        debugLog(`Tempo slider changed to ${this.tempoSlider.value}`);
        this.updateTempo(this.tempoSlider.value);
      });
      
      if (this.beatsSelect) {
        this.beatsSelect.addEventListener('change', () => {
          debugLog(`Time signature changed to ${this.beatsSelect.value}/4`);
          this.updateTimeSignature();
        });
      }
      
      if (this.tempoUpButton) {
        this.tempoUpButton.addEventListener('click', () => {
          debugLog('Tempo up button clicked');
          this.changeTempo(5);
        });
      }
      
      if (this.tempoDownButton) {
        this.tempoDownButton.addEventListener('click', () => {
          debugLog('Tempo down button clicked');
          this.changeTempo(-5);
        });
      }
      
      // Initialize display
      this.updateTempoDisplay();
      
      // Mark as initialized
      this.uiInitialized = true;
      debugLog('Metronome UI initialized successfully');
      
      // Add a test button
      this.addTestButton();
    } catch (error) {
      console.error('Error initializing metronome UI:', error);
      debugLog(`ERROR: ${error.message}`);
    }
  }
  
  addTestButton() {
    // Set up minimal required elements for functionality, but keep them hidden
    if (!window.debugElements) {
      window.debugElements = {};
    }
    
    // Create hidden debug output element for logging
    const debugOutput = document.createElement('pre');
    debugOutput.style.display = 'none';
    window.debugElements.metronomeOutput = debugOutput;
    
    // Add element to document body (hidden)
    document.body.appendChild(debugOutput);
  }
  
  toggleMetronome() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
  }
  
  async start() {
    try {
      debugLog('Starting metronome');
      if (this.isPlaying) {
        debugLog('Already playing, ignoring start request');
        return;
      }
      
      // Initialize audio
      if (!this.audioContext) {
        debugLog('Creating new AudioContext');
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      // Check AudioContext state
      debugLog(`AudioContext state before resume: ${this.audioContext.state}`);
      
      // Resume suspended context (needed for browsers with autoplay restrictions)
      if (this.audioContext.state === 'suspended') {
        debugLog('Resuming suspended AudioContext');
        try {
          await this.audioContext.resume();
          debugLog(`AudioContext resumed successfully, new state: ${this.audioContext.state}`);
        } catch (e) {
          debugLog(`Failed to resume AudioContext: ${e.message}`);
          alert('Could not start audio. Try clicking again or check browser permissions.');
          return;
        }
      }
      
      // Play immediate test sound to verify audio is working
      this.playTestSound();
      
      // Update UI
      this.isPlaying = true;
      if (this.startButton) {
        this.startButton.textContent = 'Stop';
      }
      
      // Reset counter and start timing
      this.currentBeat = 0;
      this.nextTime = this.audioContext.currentTime;
      
      // Start scheduling timeline
      debugLog('Starting scheduler interval');
      this.intervalID = setInterval(() => this.tick(), 25);
    } catch (error) {
      debugLog(`ERROR starting metronome: ${error.message}`);
      console.error('Error starting metronome:', error);
    }
  }
  
  stop() {
    debugLog('Stopping metronome');
    this.isPlaying = false;
    if (this.startButton) {
      this.startButton.textContent = 'Start';
    }
    
    if (this.intervalID !== null) {
      clearInterval(this.intervalID);
      this.intervalID = null;
    }
  }
  
  playTestSound() {
    try {
      if (!this.audioContext) {
        debugLog('Creating AudioContext for test sound');
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      debugLog(`Playing test sound, AudioContext state: ${this.audioContext.state}`);
      
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.frequency.value = 440;
      oscillator.type = 'sine';
      
      gainNode.gain.value = 0.5;
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      const now = this.audioContext.currentTime;
      oscillator.start(now);
      oscillator.stop(now + 0.2);
      
      debugLog('Test sound scheduled successfully');
    } catch (error) {
      debugLog(`ERROR playing test sound: ${error.message}`);
      console.error('Error playing test sound:', error);
    }
  }
  
  tick() {
    if (!this.isPlaying) return;
    
    try {
      // Schedule notes slightly ahead of time
      const lookAheadTime = 0.1; // seconds
      const now = this.audioContext.currentTime;
      
      // Schedule a beat if it's time
      if (this.nextTime <= now + lookAheadTime) {
        this.playBeat(this.nextTime, this.currentBeat);
        
        // Calculate next beat time
        const secondsPerBeat = 60.0 / this.tempo;
        this.nextTime += secondsPerBeat;
        
        // Move to next beat
        this.currentBeat = (this.currentBeat + 1) % this.beatsPerMeasure;
      }
    } catch (error) {
      debugLog(`ERROR in tick: ${error.message}`);
      console.error('Error in metronome tick:', error);
    }
  }
  
  playBeat(time, beatNumber) {
    try {
      // Create sound components
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      // Set different sound for first beat (accent)
      if (beatNumber === 0) {
        oscillator.frequency.value = 880; // Higher pitch for accent
      } else {
        oscillator.frequency.value = 440;
      }
      
      // Set up quick decay envelope
      gainNode.gain.setValueAtTime(0.5, time);
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
      
      // Connect and schedule
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.start(time);
      oscillator.stop(time + 0.1);
      
      // Visual feedback
      this.scheduleTick(beatNumber, time);
      
      debugLog(`Beat ${beatNumber + 1} scheduled at time ${time.toFixed(3)}`);
    } catch (error) {
      debugLog(`ERROR playing beat: ${error.message}`);
      console.error('Error playing beat:', error);
    }
  }
  
  scheduleTick(beatNumber, time) {
    if (!this.tempoDisplay) return;
    
    const now = this.audioContext.currentTime;
    const delay = Math.max(0, (time - now) * 1000);
    
    setTimeout(() => {
      if (!this.isPlaying) return;
      
      this.tempoDisplay.style.color = beatNumber === 0 ? '#e74c3c' : '#3498db';
      
      setTimeout(() => {
        if (this.tempoDisplay) {
          this.tempoDisplay.style.color = '';
        }
      }, 100);
    }, delay);
  }
  
  updateTempo(newTempo) {
    this.tempo = parseInt(newTempo);
    this.updateTempoDisplay();
  }
  
  updateTempoDisplay() {
    if (this.tempoDisplay) {
      this.tempoDisplay.textContent = this.tempo + ' BPM';
    }
    
    if (this.tempoSlider) {
      this.tempoSlider.value = this.tempo;
    }
  }
  
  changeTempo(amount) {
    const newTempo = Math.max(40, Math.min(220, this.tempo + amount));
    this.updateTempo(newTempo);
    debugLog(`Tempo changed to ${this.tempo} BPM`);
  }
  
  updateTimeSignature() {
    if (this.beatsSelect) {
      this.beatsPerMeasure = parseInt(this.beatsSelect.value);
      this.currentBeat = 0; // Reset
      debugLog(`Time signature updated to ${this.beatsPerMeasure}/4`);
    }
  }
}

// Initialize metronome immediately
(function() {
  console.log('Initializing metronome...');
  
  // Create the metronome global instance
  window.metronome = new Metronome();
  
  // Add a direct simple implementation as a fallback
  setupSimpleMetronome();
  
  // Update status
  const metronomeStatus = document.getElementById('metronome-status');
  if (metronomeStatus) {
    metronomeStatus.textContent = 'Metronome initialized directly';
    metronomeStatus.style.backgroundColor = '#d4ffda';
  }
})();

// Simple metronome implementation as a fallback
function setupSimpleMetronome() {
  console.log('Setting up simple metronome fallback');
  
  // Try to find elements multiple times with increasing delays
  let attempts = 0;
  const maxAttempts = 5;
  
  function initMetronome() {
    // Find required elements
    const startButton = document.getElementById('start-metronome');
    const tempoSlider = document.getElementById('tempo-slider');
    const tempoDisplay = document.querySelector('.tempo-display');
    const tempoUp = document.getElementById('tempo-up');
    const tempoDown = document.getElementById('tempo-down');
    
    // Check if essential elements exist
    if (!startButton || !tempoSlider || !tempoDisplay) {
      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(initMetronome, attempts * 500);
        return;
      }
      console.error('Simple metronome: Required elements not found after multiple attempts');
      return;
    }
  
  let tempo = 120;
  let isPlaying = false;
  let intervalId = null;
  let audioContext = null;
  
  // Simplified initialization without status updates
  
  // Update tempo display
  function updateTempoDisplay() {
    tempoDisplay.textContent = `${tempo} BPM`;
    tempoSlider.value = tempo;
  }
  
  // Play a metronome click
  function playClick() {
    try {
      // Create audio context if needed
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      // Resume context if suspended
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      // Create sound
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.frequency.value = 800;
      gain.gain.setValueAtTime(0, audioContext.currentTime);
      gain.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.01);
      gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.1);
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.start();
      osc.stop(audioContext.currentTime + 0.1);
      
      // Visual feedback
      tempoDisplay.style.color = '#e74c3c';
      setTimeout(() => {
        tempoDisplay.style.color = '';
      }, 100);
    } catch (error) {
      console.error('Simple metronome click error:', error);
    }
  }
  
  // Start/stop metronome
  function toggleMetronome() {
    if (isPlaying) {
      // Stop metronome
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      isPlaying = false;
      startButton.textContent = 'Start';
      
      if (metronomeStatus) {
        metronomeStatus.textContent = 'Simple metronome stopped';
      }
    } else {
      // Start metronome
      try {
        // Create audio context if needed
        if (!audioContext) {
          audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // Calculate interval in milliseconds
        const interval = 60000 / tempo;
        
        // Play first click immediately
        playClick();
        
        // Schedule regular clicks
        intervalId = setInterval(playClick, interval);
        
        isPlaying = true;
        startButton.textContent = 'Stop';
        
        // Status updates removed
      } catch (error) {
        console.error('Error starting simple metronome:', error);
        // Error updates removed
      }
    }
  }
  
  // Change tempo
  function changeTempo(amount) {
    tempo = Math.max(40, Math.min(220, tempo + amount));
    updateTempoDisplay();
    
    // If playing, restart with new tempo
    if (isPlaying) {
      if (intervalId) {
        clearInterval(intervalId);
      }
      const interval = 60000 / tempo;
      intervalId = setInterval(playClick, interval);
      
      // Status updates removed
    }
  }
  
  // Set event listeners
  startButton.addEventListener('click', toggleMetronome);
  
  if (tempoSlider) {
    tempoSlider.addEventListener('input', () => {
      tempo = parseInt(tempoSlider.value);
      updateTempoDisplay();
      
      // If playing, restart with new tempo
      if (isPlaying) {
        if (intervalId) {
          clearInterval(intervalId);
        }
        const interval = 60000 / tempo;
        intervalId = setInterval(playClick, interval);
      }
    });
  }
  
  if (tempoUp) {
    tempoUp.addEventListener('click', () => changeTempo(5));
  }
  
  if (tempoDown) {
    tempoDown.addEventListener('click', () => changeTempo(-5));
  }
  
  // Initialize display
  updateTempoDisplay();
  
  console.log('Simple metronome initialized successfully');
  }
  
  // Start the initialization process
  initMetronome();
}