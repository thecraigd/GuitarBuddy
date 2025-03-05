// Scale library module
class ScaleLibrary {
  constructor() {
    // UI Elements
    this.scaleRoot = document.getElementById('scale-root');
    this.scaleType = document.getElementById('scale-type');
    this.scaleDiagram = document.querySelector('.scale-diagram');
    
    // Scale interval patterns (semitones from root)
    this.scalePatterns = {
      'major': [0, 2, 4, 5, 7, 9, 11],            // Major scale (Ionian)
      'minor': [0, 2, 3, 5, 7, 8, 10],            // Natural minor (Aeolian)
      'harmonic_minor': [0, 2, 3, 5, 7, 8, 11],   // Harmonic minor
      'melodic_minor': [0, 2, 3, 5, 7, 9, 11],    // Melodic minor (ascending)
      'pentatonic_major': [0, 2, 4, 7, 9],        // Major pentatonic
      'pentatonic_minor': [0, 3, 5, 7, 10],       // Minor pentatonic
      'blues': [0, 3, 5, 6, 7, 10],               // Blues scale
      'dorian': [0, 2, 3, 5, 7, 9, 10],           // Dorian mode
      'phrygian': [0, 1, 3, 5, 7, 8, 10],         // Phrygian mode
      'lydian': [0, 2, 4, 6, 7, 9, 11],           // Lydian mode
      'mixolydian': [0, 2, 4, 5, 7, 9, 10],       // Mixolydian mode
      'locrian': [0, 1, 3, 5, 6, 8, 10]           // Locrian mode
    };
    
    // Note names and their numeric values
    this.notes = [
      { name: 'C', value: 0 },
      { name: 'C#', value: 1 },
      { name: 'D', value: 2 },
      { name: 'D#', value: 3 },
      { name: 'E', value: 4 },
      { name: 'F', value: 5 },
      { name: 'F#', value: 6 },
      { name: 'G', value: 7 },
      { name: 'G#', value: 8 },
      { name: 'A', value: 9 },
      { name: 'A#', value: 10 },
      { name: 'B', value: 11 }
    ];
    
    // Standard guitar tuning (E standard)
    this.guitarTuning = [4, 9, 2, 7, 11, 4]; // E, A, D, G, B, E values
    
    this.init();
  }
  
  init() {
    // Add event listeners to UI elements
    this.updateButton = document.getElementById('update-scale');
    this.debugOutput = document.getElementById('scale-debug');
    
    if (this.updateButton) {
      this.updateButton.addEventListener('click', () => this.updateScaleDiagram());
    } else {
      // For backward compatibility, add listeners to select elements
      this.scaleRoot.addEventListener('change', () => this.updateScaleDiagram());
      this.scaleType.addEventListener('change', () => this.updateScaleDiagram());
    }
    
    // Debug info is now hidden
    
    // Initialize with default scale - delay slightly to ensure DOM is ready
    setTimeout(() => this.updateScaleDiagram(), 300);
  }
  
  updateScaleDiagram() {
    try {
      const root = this.scaleRoot.value;
      const type = this.scaleType.value;
      
      let debugInfo = `Root: ${root}, Type: ${type}\n`;
      console.log(`Updating scale diagram for ${root} ${type}`);
      
      // Display available scale patterns for debugging
      debugInfo += `Available scale types:\n${Object.keys(this.scalePatterns).join(', ')}\n\n`;
      debugInfo += `Available notes:\n${this.notes.map(n => n.name).join(', ')}\n\n`;
      
      // Get the scale pattern
      debugInfo += `Looking for scale pattern: "${type}"\n`;
      const scalePattern = this.scalePatterns[type];
      
      if (!scalePattern) {
        debugInfo += `ERROR: Scale pattern not found for ${type}\n`;
        console.error(`Scale pattern not found for ${type}`);
        this.scaleDiagram.innerHTML = `<p>Scale pattern not found for ${type}</p>`;
        
        if (this.debugOutput) {
          this.debugOutput.textContent = debugInfo;
        }
        return;
      }
      
      debugInfo += `Found scale pattern: [${scalePattern.join(', ')}]\n`;
      
      // Get the root note value
      debugInfo += `Looking for root note: "${root}"\n`;
      const rootNote = this.notes.find(note => note.name === root);
      
      if (!rootNote) {
        debugInfo += `ERROR: Root note not found: ${root}\n`;
        console.error(`Root note not found: ${root}`);
        this.scaleDiagram.innerHTML = `<p>Root note not found: ${root}</p>`;
        
        if (this.debugOutput) {
          this.debugOutput.textContent = debugInfo;
        }
        return;
      }
      
      debugInfo += `Found root note: ${rootNote.name} (value: ${rootNote.value})\n`;
      
      // Calculate the actual scale notes
      const scaleNotes = this.calculateScaleNotes(rootNote.value, scalePattern);
      debugInfo += `Scale notes values: ${scaleNotes.join(', ')}\n`;
      debugInfo += `Scale notes names: ${scaleNotes.map(val => this.notes.find(n => n.value === val).name).join(', ')}\n`;
      
      // Update debug display
      if (this.debugOutput) {
        this.debugOutput.textContent = debugInfo;
      }
      
      // Render the scale on the fretboard
      this.renderScaleDiagram(root, type, scaleNotes);
    } catch (error) {
      console.error('Error updating scale diagram:', error);
      if (this.debugOutput) {
        this.debugOutput.textContent = `ERROR: ${error.message}\n${error.stack}`;
      }
    }
  }
  
  calculateScaleNotes(rootValue, pattern) {
    // Generate the complete scale by adding the root value to each interval
    return pattern.map(interval => (rootValue + interval) % 12);
  }
  
  renderScaleDiagram(root, type, scaleNotes) {
    // Clear previous diagram
    this.scaleDiagram.innerHTML = '';
    
    // Create scale name display
    const scaleName = document.createElement('h3');
    scaleName.textContent = `${root} ${type.replace('_', ' ')}`;
    this.scaleDiagram.appendChild(scaleName);
    
    // Create note list
    const noteList = document.createElement('div');
    noteList.className = 'scale-notes';
    noteList.innerHTML = '<p>Scale notes: ' + 
      scaleNotes.map(noteValue => this.notes.find(n => n.value === noteValue).name).join(' - ') + 
      '</p>';
    this.scaleDiagram.appendChild(noteList);
    
    // Create diagram container to control width
    const diagramContainer = document.createElement('div');
    diagramContainer.className = 'diagram-container';
    diagramContainer.style.width = '100%';
    diagramContainer.style.overflowX = 'auto';
    diagramContainer.style.paddingBottom = '10px';
    
    // Create fretboard with fixed width to ensure proper display
    const fretboard = document.createElement('div');
    fretboard.className = 'fretboard';
    fretboard.style.width = 'fit-content';
    fretboard.style.minWidth = '100%';
    fretboard.style.maxWidth = '100%';
    
    // Number of frets to display - reduced to improve display on mobile
    const numFrets = 12;
    
    // String labels for standard tuning (from lowest to highest)
    const stringLabels = ['E', 'A', 'D', 'G', 'B', 'e'];
    
    // Create string rows - INVERTED order to match standard notation (low E at bottom)
    for (let stringIdx = 5; stringIdx >= 0; stringIdx--) {
      const stringDiv = document.createElement('div');
      stringDiv.className = 'guitar-string';
      
      // Add string label first
      const stringLabel = document.createElement('div');
      stringLabel.className = 'fret string-label';
      stringLabel.textContent = stringLabels[stringIdx];
      stringDiv.appendChild(stringLabel);
      
      // Get the open string note
      const openStringValue = this.guitarTuning[stringIdx];
      
      // Create fret positions
      for (let fret = 0; fret <= numFrets; fret++) {
        const fretDiv = document.createElement('div');
        fretDiv.className = 'fret';
        
        // Make frets more compact
        fretDiv.style.width = '30px';
        
        // Calculate note at this fret
        const noteValue = (openStringValue + fret) % 12;
        
        // If this note is in our scale, mark it
        if (scaleNotes.includes(noteValue)) {
          const noteMarker = document.createElement('div');
          noteMarker.className = 'finger-marker';
          
          // Highlight the root notes
          if (noteValue === scaleNotes[0]) {
            noteMarker.style.background = 'linear-gradient(135deg, var(--accent-color), #b5179e)';
            noteMarker.classList.add('root-marker');
          }
          
          // Get the note name
          const noteName = this.notes.find(n => n.value === noteValue).name;
          noteMarker.textContent = noteName;
          
          // Make font smaller for better fit
          noteMarker.style.fontSize = '10px';
          noteMarker.style.width = '22px';
          noteMarker.style.height = '22px';
          
          fretDiv.appendChild(noteMarker);
        }
        
        // Add string line
        const stringLine = document.createElement('div');
        stringLine.className = 'string-line';
        fretDiv.appendChild(stringLine);
        
        stringDiv.appendChild(fretDiv);
      }
      
      fretboard.appendChild(stringDiv);
    }
    
    // Add fret markers below
    const fretMarkers = document.createElement('div');
    fretMarkers.className = 'fret-markers';
    
    // Empty marker for the string label column
    const emptyMarker = document.createElement('div');
    emptyMarker.className = 'fret-marker';
    emptyMarker.style.width = '30px';
    fretMarkers.appendChild(emptyMarker);
    
    for (let fret = 0; fret <= numFrets; fret++) {
      const markerDiv = document.createElement('div');
      markerDiv.className = 'fret-marker';
      markerDiv.style.width = '30px';
      markerDiv.textContent = fret;
      fretMarkers.appendChild(markerDiv);
    }
    
    diagramContainer.appendChild(fretboard);
    diagramContainer.appendChild(fretMarkers);
    this.scaleDiagram.appendChild(diagramContainer);
    
    // Add explanation
    const explanation = document.createElement('div');
    explanation.className = 'scale-explanation';
    explanation.style.marginTop = '15px';
    explanation.style.fontSize = '0.9rem';
    explanation.innerHTML = `
      <p>Red dots: Root notes (${root})</p>
      <p>Blue dots: Other scale notes</p>
    `;
    
    this.scaleDiagram.appendChild(explanation);
  }
}

// Initialize the scale library when page loads - with safety timeout
function initScaleLibrary() {
  console.log('Initializing scale library...');
  try {
    window.scaleLibrary = new ScaleLibrary();
    console.log('Scale library initialized successfully');
  } catch (error) {
    console.error('Error initializing scale library:', error);
    
    // If DOM isn't fully ready, retry after a delay
    setTimeout(initScaleLibrary, 500);
  }
}

// Start initialization with a delay to ensure DOM is ready
setTimeout(initScaleLibrary, 500);