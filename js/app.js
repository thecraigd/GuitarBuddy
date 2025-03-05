// Main application file
console.log('App script loading...');

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing app...');
  
  // Register service worker for PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker registered', reg))
      .catch(err => console.error('Service Worker registration failed', err));
  }

  // Test browser audio capabilities
  if (!window.AudioContext && !window.webkitAudioContext) {
    showError('Web Audio API is not supported in your browser. Please try Chrome, Firefox, or Safari.');
    return;
  }
  
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showWarning('Microphone access is not supported in your browser. The tuner feature will not work.');
  }

  // Initialize UI and navigation
  initNavigation();
  
  // Load modules with a slight delay to ensure DOM is ready
  setTimeout(loadModules, 100);
});

// Display error message
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.style.padding = '10px';
  errorDiv.style.margin = '10px';
  errorDiv.style.backgroundColor = '#ffdddd';
  errorDiv.style.color = '#cc0000';
  errorDiv.style.borderRadius = '4px';
  errorDiv.style.fontWeight = 'bold';
  errorDiv.textContent = `ERROR: ${message}`;
  
  document.body.insertBefore(errorDiv, document.body.firstChild);
  
  console.error(message);
}

// Display warning message
function showWarning(message) {
  const warningDiv = document.createElement('div');
  warningDiv.style.padding = '10px';
  warningDiv.style.margin = '10px';
  warningDiv.style.backgroundColor = '#ffffdd';
  warningDiv.style.color = '#aaaa00';
  warningDiv.style.borderRadius = '4px';
  warningDiv.textContent = `WARNING: ${message}`;
  
  document.body.insertBefore(warningDiv, document.body.firstChild);
  
  console.warn(message);
}

// Navigation between tools
function initNavigation() {
  console.log('Initializing navigation...');
  const navButtons = document.querySelectorAll('.nav-btn');
  const sections = document.querySelectorAll('.tool-section');
  
  if (navButtons.length === 0 || sections.length === 0) {
    console.error('Navigation elements not found!');
    return;
  }
  
  console.log(`Found ${navButtons.length} nav buttons and ${sections.length} sections`);
  
  // Make sure all sections start with the right display style
  // Reset all to hidden
  sections.forEach(section => {
    section.style.display = 'none';
    section.classList.remove('active');
  });
  
  // Show only the active section
  const activeNav = document.querySelector('.nav-btn.active');
  if (activeNav) {
    const targetId = activeNav.getAttribute('data-target');
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.style.display = 'block';
      targetSection.classList.add('active');
    } else {
      // If no section found, show the first section
      sections[0].style.display = 'block';
      sections[0].classList.add('active');
      navButtons[0].classList.add('active');
    }
  } else {
    // If no active button, activate the first
    sections[0].style.display = 'block';
    sections[0].classList.add('active');
    navButtons[0].classList.add('active');
  }

  // Add click handlers for all buttons
  navButtons.forEach(button => {
    button.addEventListener('click', () => {
      const target = button.getAttribute('data-target');
      console.log(`Navigation clicked: ${target}`);
      
      // Update active button
      navButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Show target section, hide others
      sections.forEach(section => {
        if (section.id === target) {
          section.style.display = 'block';
          section.classList.add('active');
        } else {
          section.style.display = 'none';
          section.classList.remove('active');
        }
      });
    });
  });
  
  console.log('Navigation initialized successfully');
}

// Dynamically load module scripts in the correct order
function loadModules() {
  console.log('Loading application modules...');
  
  // List modules in the order they should load
  const modules = [
    { name: 'tuner', path: './js/tuner.js' },
    { name: 'metronome', path: './js/metronome.js' },
    { name: 'chords', path: './js/chords.js' },
    { name: 'scales', path: './js/scales.js' }
  ];

  // Sequential module loading with promises to ensure proper initialization
  function loadScript(moduleDef) {
    return new Promise((resolve, reject) => {
      console.log(`Loading module: ${moduleDef.name}`);
      const script = document.createElement('script');
      script.src = moduleDef.path;
      script.async = false;
      
      script.onload = () => {
        // Try to catch syntax errors that might not trigger onerror
        try {
          console.log(`Successfully loaded: ${moduleDef.name}`);
          
          // Manually initialize the modules after they're loaded
          if (moduleDef.name === 'tuner') {
            console.log('Manually initializing tuner module...');
            // The tuner module might need explicit initialization
            setTimeout(() => {
              if (window.guitarTuner === undefined) {
                console.log('Initializing tuner via setupSimpleTuner...');
                if (typeof setupSimpleTuner === 'function') {
                  setupSimpleTuner();
                }
              }
              
              // Update the status display
              const tunerStatus = document.getElementById('tuner-status');
              if (tunerStatus) {
                tunerStatus.textContent = 'Tuner initialized via app.js';
                tunerStatus.style.backgroundColor = '#d4ffda';
              }
            }, 500);
          } 
          else if (moduleDef.name === 'metronome') {
            console.log('Manually initializing metronome module...');
            // The metronome module might need explicit initialization
            setTimeout(() => {
              if (window.metronome === undefined) {
                console.log('Initializing metronome via setupSimpleMetronome...');
                if (typeof setupSimpleMetronome === 'function') {
                  setupSimpleMetronome();
                }
              }
              
              // Update the status display
              const metronomeStatus = document.getElementById('metronome-status');
              if (metronomeStatus) {
                metronomeStatus.textContent = 'Metronome initialized via app.js';
                metronomeStatus.style.backgroundColor = '#d4ffda';
              }
            }, 500);
          }
          
          resolve();
        } catch (error) {
          console.error(`Error initializing ${moduleDef.name}:`, error);
          reject(error);
        }
      };
      
      script.onerror = (error) => {
        console.error(`Error loading ${moduleDef.name}:`, error);
        reject(error);
      };
      
      document.body.appendChild(script);
    });
  }
  
  // Load scripts one after another
  modules.reduce((promiseChain, moduleDef) => {
    return promiseChain.then(() => loadScript(moduleDef));
  }, Promise.resolve())
  .then(() => {
    console.log('All modules loaded successfully');
  })
  .catch(error => {
    console.error('Error loading modules:', error);
  });
}

// Utility functions
const utils = {
  // Convert frequency to nearest note
  frequencyToNote: (frequency) => {
    if (!frequency) return null;
    
    const A4 = 440;
    const C0 = A4 * Math.pow(2, -4.75);
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    // Calculate number of half steps from C0
    const halfStepsFromC0 = Math.round(12 * Math.log2(frequency / C0));
    if (halfStepsFromC0 < 0) return null;
    
    const octave = Math.floor(halfStepsFromC0 / 12);
    const noteIndex = halfStepsFromC0 % 12;
    
    return {
      name: notes[noteIndex],
      octave: octave,
      frequency: frequency,
      difference: 0 // Will be calculated in the tuner
    };
  },
  
  // Calculate cents difference between frequencies
  getCentsDifference: (actual, target) => {
    return Math.floor(1200 * Math.log2(actual / target));
  },
  
  // Convert cents difference to tuning indicator position
  centsToPosition: (cents) => {
    // -50 to 50 cents maps to 0% to 100%
    return Math.max(0, Math.min(100, (cents + 50) * 1));
  },
  
  // Create audio context (needed for tuner and metronome)
  createAudioContext: () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Fix for browsers requiring user gesture to start audio context
    if (audioContext.state === 'suspended') {
      const resumeAudio = async () => {
        await audioContext.resume();
        console.log('AudioContext resumed');
        // Remove the event listeners once audio is resumed
        document.removeEventListener('click', resumeAudio);
        document.removeEventListener('touchstart', resumeAudio);
      };
      
      document.addEventListener('click', resumeAudio);
      document.addEventListener('touchstart', resumeAudio);
    }
    
    return audioContext;
  }
};

// Make utils available globally
window.GuitarBuddyUtils = utils;