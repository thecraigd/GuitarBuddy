// Debug helper
function tunerLog(message) {
  console.log(`[Tuner] ${message}`);
  if (window.debugElements && window.debugElements.tunerOutput) {
    const debugOutput = window.debugElements.tunerOutput;
    debugOutput.textContent += message + '\n';
    debugOutput.scrollTop = debugOutput.scrollHeight;
  }
}

// More reliable Guitar Tuner implementation
class GuitarTuner {
  constructor() {
    tunerLog('Initializing guitar tuner');
    
    // Core audio processing properties
    this.audioContext = null;
    this.analyser = null;
    this.mediaStreamSource = null;
    this.stream = null;
    this.isListening = false;
    this.targetFrequency = null;
    this.uiInitialized = false;
    
    // Standard guitar tuning frequencies
    this.guitarStrings = {
      'E2': 82.41,  // Low E (6th string)
      'A2': 110.00, // A (5th string)
      'D3': 146.83, // D (4th string)
      'G3': 196.00, // G (3rd string)
      'B3': 246.94, // B (2nd string)
      'E4': 329.63  // High E (1st string)
    };
    
    // Initialize UI with a slight delay to ensure DOM is ready
    setTimeout(() => this.initUI(), 100);
  }
  
  initUI() {
    try {
      tunerLog('Setting up tuner UI');
      
      // UI Elements
      this.noteDisplay = document.querySelector('.note-display');
      this.freqDisplay = document.querySelector('.frequency-display');
      this.indicatorBar = document.querySelector('.indicator-bar');
      this.stringButtons = document.querySelectorAll('.string-btn');
      this.startButton = document.getElementById('start-tuner');
      
      // Check if UI elements are found
      if (!this.noteDisplay || !this.freqDisplay || !this.startButton) {
        tunerLog('UI elements not ready, will retry');
        setTimeout(() => this.initUI(), 100); // Retry after a delay
        return;
      }
      
      // UI is ready, add event listeners
      tunerLog('UI elements found, adding event listeners');
      
      // Start/stop listening button
      this.startButton.addEventListener('click', () => {
        tunerLog('Start/stop button clicked');
        this.toggleListening();
      });
      
      // String reference tone buttons
      if (this.stringButtons && this.stringButtons.length > 0) {
        this.stringButtons.forEach(button => {
          button.addEventListener('click', () => {
            const note = button.getAttribute('data-note');
            const freq = parseFloat(button.getAttribute('data-freq'));
            
            tunerLog(`String button clicked: ${note} (${freq} Hz)`);
            this.targetFrequency = freq;
            this.playReferenceNote(note, freq);
          });
        });
      } else {
        tunerLog('WARNING: No string buttons found');
      }
      
      // Add test button and debug panel
      this.addDebugElements();
      
      this.uiInitialized = true;
      tunerLog('Tuner UI initialized successfully');
      
      // Create audio context
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        tunerLog(`AudioContext created, state: ${this.audioContext.state}`);
      } catch (e) {
        tunerLog(`ERROR creating AudioContext: ${e.message}`);
      }
    } catch (error) {
      console.error('Error initializing tuner UI:', error);
      tunerLog(`ERROR initializing UI: ${error.message}`);
    }
  }
  
  addDebugElements() {
    // Add debug elements to the tuner section
    // Try multiple ways to find the tuner container
    const container = document.querySelector('#tuner') || 
                      document.querySelector('.tool-section[id="tuner"]');
    
    if (container) {
      console.log('Found tuner container, adding debug elements');
    } else {
      console.error('Could not find tuner container to add debug elements');
      return;
    }
    
    // Create debug section if it doesn't exist
    if (!window.debugElements) {
      window.debugElements = {};
    }
    
    // Add a simple test button
    const testButton = document.createElement('button');
    testButton.textContent = 'Test Audio';
    testButton.className = 'action-btn';
    testButton.style.marginTop = '10px';
    testButton.style.marginBottom = '10px';
    testButton.style.width = 'auto';
    testButton.style.padding = '8px 16px';
    
    testButton.addEventListener('click', () => {
      tunerLog('Test audio button clicked');
      this.testAudio();
    });
    
    // Add debug output
    const debugOutput = document.createElement('pre');
    debugOutput.style.height = '100px';
    debugOutput.style.overflow = 'auto';
    debugOutput.style.fontSize = '10px';
    debugOutput.style.backgroundColor = '#f5f5f5';
    debugOutput.style.padding = '5px';
    debugOutput.style.border = '1px solid #ddd';
    debugOutput.style.marginTop = '10px';
    
    window.debugElements.tunerOutput = debugOutput;
    
    // Add microphone status
    const micStatus = document.createElement('div');
    micStatus.id = 'mic-status';
    micStatus.style.padding = '5px';
    micStatus.style.backgroundColor = '#ffeeee';
    micStatus.style.borderRadius = '4px';
    micStatus.style.marginTop = '10px';
    micStatus.textContent = 'Microphone: Not accessed yet';
    
    // Add elements to page
    container.appendChild(testButton);
    container.appendChild(micStatus);
    container.appendChild(debugOutput);
  }
  
  // Test audio setup
  async testAudio() {
    try {
      tunerLog('Testing audio system...');
      
      // Create audio context if needed
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      // Resume context if needed
      if (this.audioContext.state === 'suspended') {
        tunerLog('Resuming suspended audio context...');
        await this.audioContext.resume();
      }
      
      tunerLog(`AudioContext state: ${this.audioContext.state}`);
      
      // Test with a simple beep
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.value = 440;
      
      gainNode.gain.value = 0.5;
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.5);
      
      tunerLog('Test tone playing at 440Hz (A4)');
      
      // Check microphone status
      try {
        tunerLog('Checking for microphone permission...');
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(device => device.kind === 'audioinput');
        
        tunerLog(`Found ${audioInputs.length} audio input devices`);
        
        if (audioInputs.length === 0) {
          tunerLog('WARNING: No audio input devices found');
        } else {
          // Check permissions
          const hasPermissions = audioInputs.some(device => device.deviceId && device.label);
          if (hasPermissions) {
            tunerLog('Microphone access appears to be granted');
            this.updateMicStatus('Available', '#eeffee');
          } else {
            tunerLog('Microphone access not yet granted');
            this.updateMicStatus('Permission needed', '#ffffee');
          }
        }
      } catch (e) {
        tunerLog(`Error checking microphone: ${e.message}`);
      }
    } catch (error) {
      tunerLog(`ERROR testing audio: ${error.message}`);
      console.error('Error testing audio:', error);
    }
  }
  
  updateMicStatus(message, color = '#ffeeee') {
    const statusElement = document.getElementById('mic-status');
    if (statusElement) {
      statusElement.textContent = `Microphone: ${message}`;
      statusElement.style.backgroundColor = color;
    }
  }
  
  toggleListening() {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }
  
  async startListening() {
    if (this.isListening) {
      tunerLog('Already listening, ignoring request');
      return;
    }
    
    tunerLog('Starting microphone listening...');
    
    try {
      // Create/resume audio context
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      if (this.audioContext.state === 'suspended') {
        tunerLog('Resuming audio context...');
        await this.audioContext.resume();
        tunerLog(`Audio context state: ${this.audioContext.state}`);
      }
      
      // Explicitly set up microphone with good parameters for pitch detection
      const constraints = {
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          channelCount: 1,
          sampleRate: 44100
        }
      };
      
      tunerLog('Requesting microphone access...');
      this.updateMicStatus('Requesting access...', '#ffffee');
      
      try {
        this.stream = await navigator.mediaDevices.getUserMedia(constraints);
        tunerLog('Microphone access granted!');
        this.updateMicStatus('Active', '#eeffee');
        
        // Set up audio processing
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048; // For better frequency resolution
        
        this.mediaStreamSource = this.audioContext.createMediaStreamSource(this.stream);
        this.mediaStreamSource.connect(this.analyser);
        
        // Update UI
        this.isListening = true;
        this.startButton.textContent = 'Stop Listening';
        this.noteDisplay.textContent = 'Listening...';
        this.freqDisplay.textContent = 'Play a note';
        
        // Start the update loop
        this.updateTuner();
        tunerLog('Tuner is now active and analyzing input');
      } catch (e) {
        tunerLog(`ERROR accessing microphone: ${e.message}`);
        this.updateMicStatus('Access denied', '#ffeeee');
        alert(`Could not access the microphone: ${e.message}\n\nPlease check your browser permissions.`);
      }
    } catch (error) {
      tunerLog(`ERROR starting listening: ${error.message}`);
      console.error('Error starting tuner:', error);
    }
  }
  
  stopListening() {
    tunerLog('Stopping microphone listening');
    
    if (this.stream) {
      // Stop all audio tracks
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.mediaStreamSource) {
      this.mediaStreamSource.disconnect();
      this.mediaStreamSource = null;
    }
    
    this.isListening = false;
    
    // Update UI
    if (this.startButton) {
      this.startButton.textContent = 'Start Listening';
    }
    
    if (this.noteDisplay) {
      this.noteDisplay.textContent = '--';
    }
    
    if (this.freqDisplay) {
      this.freqDisplay.textContent = '0 Hz';
    }
    
    if (this.indicatorBar) {
      this.indicatorBar.style.left = '50%';
    }
    
    this.updateMicStatus('Stopped', '#ffeeee');
  }
  
  updateTuner() {
    if (!this.isListening || !this.analyser) {
      return;
    }
    
    try {
      // Get audio data
      const bufferLength = this.analyser.fftSize;
      const timeData = new Float32Array(bufferLength);
      this.analyser.getFloatTimeDomainData(timeData);
      
      // Detect pitch
      const frequency = this.detectPitch(timeData, this.audioContext.sampleRate);
      
      if (frequency > 0) {
        // Valid frequency detected
        const note = this.frequencyToNote(frequency);
        if (note) {
          // Update UI with note information
          this.noteDisplay.textContent = note.name;
          this.freqDisplay.textContent = `${frequency.toFixed(1)} Hz`;
          
          // If we have a target frequency, show tuning indicator
          if (this.targetFrequency) {
            // Calculate cents difference (how far from target note)
            const cents = this.getCentsDifference(frequency, this.targetFrequency);
            
            // Update tuning indicator
            this.updateTuningIndicator(cents);
          }
        }
      }
      
      // Continue the detection loop
      requestAnimationFrame(() => this.updateTuner());
    } catch (error) {
      tunerLog(`ERROR in update loop: ${error.message}`);
      this.stopListening(); // Safety stop on error
    }
  }
  
  updateTuningIndicator(cents) {
    // Position indicator based on cents difference (-50 to +50 cents range)
    // Map -50..+50 to 0..100% for position
    const position = Math.max(0, Math.min(100, (cents + 50) * 1));
    this.indicatorBar.style.left = `${position}%`;
    
    // Set color based on how in-tune we are
    if (Math.abs(cents) < 5) {
      // Very close - green
      this.indicatorBar.style.backgroundColor = '#2ecc71';
    } else if (Math.abs(cents) < 15) {
      // Getting close - yellow/orange
      this.indicatorBar.style.backgroundColor = '#f39c12';
    } else {
      // Far off - red
      this.indicatorBar.style.backgroundColor = '#e74c3c';
    }
  }
  
  // Pitch detection algorithm using autocorrelation
  detectPitch(buffer, sampleRate) {
    const bufferLength = buffer.length;
    
    // Calculate signal strength (RMS)
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += buffer[i] * buffer[i];
    }
    const rms = Math.sqrt(sum / bufferLength);
    
    // Ignore if signal is too weak
    if (rms < 0.01) return -1;
    
    // YIN-based autocorrelation algorithm
    let bestR = 0;
    let bestK = -1;
    
    // Search for periodicity (minimum period size to avoid octave errors)
    const minPeriod = Math.floor(sampleRate / 1000); // ~1000Hz max frequency
    const maxPeriod = Math.floor(sampleRate / 60);   // ~60Hz min frequency
    
    // Simplified YIN algorithm
    for (let k = minPeriod; k < maxPeriod; k++) {
      let curR = 0;
      
      // Calculate autocorrelation for lag k
      for (let i = 0; i < bufferLength - k; i++) {
        curR += buffer[i] * buffer[i + k];
      }
      
      // Normalize
      curR = curR / (bufferLength - k);
      
      // Find highest correlation
      if (curR > bestR) {
        bestR = curR;
        bestK = k;
      }
    }
    
    // If we found a good correlation and it's strong enough
    if (bestK > 0 && bestR > 0.01) {
      const frequency = sampleRate / bestK;
      return frequency;
    }
    
    return -1; // No pitch detected
  }
  
  // Convert frequency to note
  frequencyToNote(frequency) {
    if (!frequency) return null;
    
    const A4 = 440;
    const C0 = A4 * Math.pow(2, -4.75);
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    // Calculate half steps from C0
    const halfStepsFromC0 = Math.round(12 * Math.log2(frequency / C0));
    if (halfStepsFromC0 < 0) return null;
    
    const octave = Math.floor(halfStepsFromC0 / 12);
    const noteIndex = halfStepsFromC0 % 12;
    
    return {
      name: notes[noteIndex],
      octave: octave,
      frequency: frequency
    };
  }
  
  // Calculate cents difference between frequencies
  getCentsDifference(actual, target) {
    return Math.floor(1200 * Math.log2(actual / target));
  }
  
  // Play a reference tone for a guitar string
  async playReferenceNote(note, freq) {
    try {
      tunerLog(`Playing reference tone: ${note} at ${freq} Hz`);
      
      // Create/resume audio context
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      // Stop any existing oscillator
      if (this.oscillator) {
        try {
          this.oscillator.stop();
          this.oscillator.disconnect();
        } catch (e) {
          // Ignore errors from already stopped oscillators
        }
      }
      
      // Create new oscillator
      this.oscillator = this.audioContext.createOscillator();
      this.oscillator.type = 'sine';
      this.oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
      
      // Create gain node for envelope
      const gainNode = this.audioContext.createGain();
      
      // Create nice envelope (fade in/out)
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, this.audioContext.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 2);
      
      // Connect and play
      this.oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      this.oscillator.start();
      this.oscillator.stop(this.audioContext.currentTime + 2);
      
      // Update UI while reference is playing
      this.noteDisplay.textContent = note;
      this.freqDisplay.textContent = freq.toFixed(2) + ' Hz';
      
      // Set target frequency for tuning indicator
      this.targetFrequency = freq;
      
      tunerLog(`Reference tone playing: ${note} (${freq} Hz)`);
    } catch (error) {
      tunerLog(`ERROR playing reference note: ${error.message}`);
      console.error('Error playing reference note:', error);
    }
  }
}

// Initialize the tuner immediately
(function() {
  console.log('Initializing tuner...');
  
  // Main tuner implementation
  window.guitarTuner = new GuitarTuner();
  
  // Add a simple reference tone player as fallback
  setupSimpleTuner();
  
  // Update status
  const tunerStatus = document.getElementById('tuner-status');
  if (tunerStatus) {
    tunerStatus.textContent = 'Tuner initialized directly';
    tunerStatus.style.backgroundColor = '#d4ffda';
  }
})();

// Simple reference tone generator as fallback
function setupSimpleTuner() {
  console.log('Setting up simple tuner fallback');
  
  // Try to find elements multiple times with increasing delays
  let attempts = 0;
  const maxAttempts = 5;
  
  function initTuner() {
    console.log(`Tuner initialization attempt ${attempts + 1}...`);
    
    const stringButtons = document.querySelectorAll('.string-btn');
    const noteDisplay = document.querySelector('.note-display');
    const freqDisplay = document.querySelector('.frequency-display');
    const startButton = document.getElementById('start-tuner');
    const tunerStatus = document.getElementById('tuner-status');
    const testButton = document.getElementById('tuner-test-sound');
    
    // Debug what elements we found
    console.log(`Found tuner elements: 
      stringButtons: ${stringButtons.length}, 
      noteDisplay: ${!!noteDisplay}, 
      freqDisplay: ${!!freqDisplay},
      startButton: ${!!startButton},
      tunerStatus: ${!!tunerStatus},
      testButton: ${!!testButton}`);
    
    if (!stringButtons.length || !noteDisplay || !freqDisplay) {
      attempts++;
      if (attempts < maxAttempts) {
        console.log(`Tuner elements not found, will retry in ${attempts * 500}ms`);
        setTimeout(initTuner, attempts * 500);
        return;
      }
      console.error('Simple tuner: Required elements not found after multiple attempts');
      if (tunerStatus) {
        tunerStatus.textContent = 'Error: Tuner elements not found';
        tunerStatus.style.backgroundColor = '#ffdddd';
      }
      return;
    }
  
  let audioContext = null;
  let currentOscillator = null;
  
  // Update the tuner status
  if (tunerStatus) {
    tunerStatus.textContent = 'Simple tuner initialized';
    tunerStatus.style.backgroundColor = '#d4ffda';
  }
  
  // Play a reference tone for a string
  function playReferenceTone(note, frequency) {
    try {
      // Create audio context if needed
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      // Resume context if suspended
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      // Stop any currently playing tone
      if (currentOscillator) {
        try {
          currentOscillator.stop();
          currentOscillator.disconnect();
        } catch (e) {
          // Ignore errors from already stopped oscillators
        }
      }
      
      // Update displays
      noteDisplay.textContent = note;
      freqDisplay.textContent = `${frequency.toFixed(2)} Hz`;
      
      // Create new oscillator
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      
      // Create nice envelope (fade in/out)
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 2);
      
      // Connect and play
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 2);
      
      // Store current oscillator for stopping later
      currentOscillator = oscillator;
      
      if (tunerStatus) {
        tunerStatus.textContent = `Playing reference tone: ${note} at ${frequency.toFixed(2)} Hz`;
        tunerStatus.style.backgroundColor = '#d4ffda';
      }
      
      console.log(`Simple tuner playing ${note} at ${frequency} Hz`);
    } catch (error) {
      console.error('Error playing reference tone:', error);
      if (tunerStatus) {
        tunerStatus.textContent = 'ERROR: ' + error.message;
        tunerStatus.style.backgroundColor = '#ffd4d4';
      }
    }
  }
  
  // Add listeners to string buttons
  stringButtons.forEach(button => {
    button.addEventListener('click', () => {
      const note = button.getAttribute('data-note');
      const freq = parseFloat(button.getAttribute('data-freq'));
      
      console.log(`String button clicked: ${note} (${freq} Hz)`);
      playReferenceTone(note, freq);
    });
  });
  
  // Add listener to test button if it exists
  if (testButton) {
    testButton.addEventListener('click', () => {
      console.log('Test tone button clicked');
      playReferenceTone('A4', 440);
    });
  }
  
  // The start listening button won't really work in this simple implementation
  // but we'll handle it to show a message
  if (startButton) {
    startButton.addEventListener('click', () => {
      if (tunerStatus) {
        tunerStatus.textContent = 'Microphone input not available in simple mode. Use string buttons for reference tones.';
        tunerStatus.style.backgroundColor = '#fff3cd';
      }
      
      console.log('Microphone listening not implemented in simple mode');
    });
  }
  
  console.log('Simple tuner initialized successfully');
  }
  
  // Start the initialization process
  initTuner();
}