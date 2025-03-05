// Chord library module
class ChordLibrary {
  constructor() {
    // UI Elements
    this.chordRoot = document.getElementById('chord-root');
    this.chordType = document.getElementById('chord-type');
    this.chordDiagram = document.querySelector('.chord-diagram');
    
    // Chord data - notation: [string6, string5, string4, string3, string2, string1]
    // X = muted, 0 = open string, number = fret position
    this.chordData = {
      // Major chords
      'C-major': { positions: ['X', '3', '2', '0', '1', '0'], fingering: ['X', '3', '2', '0', '1', '0'] },
      'D-major': { positions: ['X', 'X', '0', '2', '3', '2'], fingering: ['X', 'X', '0', '2', '3', '1'] },
      'E-major': { positions: ['0', '2', '2', '1', '0', '0'], fingering: ['0', '2', '3', '1', '0', '0'] },
      'F-major': { positions: ['1', '3', '3', '2', '1', '1'], fingering: ['1', '3', '4', '2', '1', '1'] },
      'G-major': { positions: ['3', '2', '0', '0', '0', '3'], fingering: ['2', '1', '0', '0', '0', '3'] },
      'A-major': { positions: ['X', '0', '2', '2', '2', '0'], fingering: ['X', '0', '2', '3', '4', '0'] },
      'B-major': { positions: ['X', '2', '4', '4', '4', '2'], fingering: ['X', '1', '2', '3', '4', '1'] },
      
      // Minor chords
      'C-minor': { positions: ['X', '3', '5', '5', '4', '3'], fingering: ['X', '1', '3', '4', '2', '1'] },
      'D-minor': { positions: ['X', 'X', '0', '2', '3', '1'], fingering: ['X', 'X', '0', '2', '3', '1'] },
      'E-minor': { positions: ['0', '2', '2', '0', '0', '0'], fingering: ['0', '2', '3', '0', '0', '0'] },
      'F-minor': { positions: ['1', '3', '3', '1', '1', '1'], fingering: ['1', '3', '4', '1', '1', '1'] },
      'G-minor': { positions: ['3', '5', '5', '3', '3', '3'], fingering: ['1', '3', '4', '1', '1', '1'] },
      'A-minor': { positions: ['X', '0', '2', '2', '1', '0'], fingering: ['X', '0', '2', '3', '1', '0'] },
      'B-minor': { positions: ['X', '2', '4', '4', '3', '2'], fingering: ['X', '1', '3', '4', '2', '1'] },
      
      // 7th chords
      'C-7': { positions: ['X', '3', '2', '3', '1', '0'], fingering: ['X', '3', '2', '4', '1', '0'] },
      'D-7': { positions: ['X', 'X', '0', '2', '1', '2'], fingering: ['X', 'X', '0', '2', '1', '3'] },
      'E-7': { positions: ['0', '2', '0', '1', '0', '0'], fingering: ['0', '2', '0', '1', '0', '0'] },
      'F-7': { positions: ['1', '3', '1', '2', '1', '1'], fingering: ['1', '3', '1', '2', '1', '1'] },
      'G-7': { positions: ['3', '2', '0', '0', '0', '1'], fingering: ['3', '2', '0', '0', '0', '1'] },
      'A-7': { positions: ['X', '0', '2', '0', '2', '0'], fingering: ['X', '0', '2', '0', '3', '0'] },
      'B-7': { positions: ['X', '2', '1', '2', '0', '2'], fingering: ['X', '2', '1', '3', '0', '4'] },
      
      // Major 7th chords
      'C-maj7': { positions: ['X', '3', '2', '0', '0', '0'], fingering: ['X', '3', '2', '0', '0', '0'] },
      'D-maj7': { positions: ['X', 'X', '0', '2', '2', '2'], fingering: ['X', 'X', '0', '1', '2', '3'] },
      'E-maj7': { positions: ['0', '2', '1', '1', '0', '0'], fingering: ['0', '3', '1', '2', '0', '0'] },
      'F-maj7': { positions: ['1', '3', '2', '2', '1', '1'], fingering: ['1', '4', '2', '3', '1', '1'] },
      'G-maj7': { positions: ['3', '2', '0', '0', '0', '2'], fingering: ['3', '2', '0', '0', '0', '1'] },
      'A-maj7': { positions: ['X', '0', '2', '1', '2', '0'], fingering: ['X', '0', '3', '1', '2', '0'] },
      'B-maj7': { positions: ['X', '2', '4', '3', '4', '2'], fingering: ['X', '1', '3', '2', '4', '1'] },
      
      // Minor 7th chords
      'C-min7': { positions: ['X', '3', '5', '3', '4', '3'], fingering: ['X', '1', '3', '1', '2', '1'] },
      'D-min7': { positions: ['X', 'X', '0', '2', '1', '1'], fingering: ['X', 'X', '0', '2', '1', '1'] },
      'E-min7': { positions: ['0', '2', '0', '0', '0', '0'], fingering: ['0', '2', '0', '0', '0', '0'] },
      'F-min7': { positions: ['1', '3', '1', '1', '1', '1'], fingering: ['1', '3', '1', '1', '1', '1'] },
      'G-min7': { positions: ['3', '5', '3', '3', '3', '3'], fingering: ['1', '3', '1', '1', '1', '1'] },
      'A-min7': { positions: ['X', '0', '2', '0', '1', '0'], fingering: ['X', '0', '2', '0', '1', '0'] },
      'B-min7': { positions: ['X', '2', '0', '2', '0', '2'], fingering: ['X', '1', '0', '2', '0', '3'] },
      
      // Sus chords
      'C-sus2': { positions: ['X', '3', '0', '0', '1', '3'], fingering: ['X', '2', '0', '0', '1', '3'] },
      'D-sus2': { positions: ['X', 'X', '0', '2', '3', '0'], fingering: ['X', 'X', '0', '1', '2', '0'] },
      'E-sus2': { positions: ['0', '2', '4', '4', '0', '0'], fingering: ['0', '1', '3', '4', '0', '0'] },
      'C-sus4': { positions: ['X', '3', '3', '0', '1', '1'], fingering: ['X', '3', '4', '0', '1', '2'] },
      'D-sus4': { positions: ['X', 'X', '0', '2', '3', '3'], fingering: ['X', 'X', '0', '1', '2', '3'] },
      'E-sus4': { positions: ['0', '2', '2', '2', '0', '0'], fingering: ['0', '1', '2', '3', '0', '0'] },
      
      // Diminished and Augmented
      'C-dim': { positions: ['X', '3', '4', '5', '4', 'X'], fingering: ['X', '1', '2', '4', '3', 'X'] },
      'D-dim': { positions: ['X', 'X', '0', '1', '0', '1'], fingering: ['X', 'X', '0', '1', '0', '2'] },
      'C-aug': { positions: ['X', '3', '2', '1', '1', 'X'], fingering: ['X', '4', '3', '1', '2', 'X'] },
      'E-aug': { positions: ['0', '3', '2', '1', '1', '0'], fingering: ['0', '4', '3', '1', '2', '0'] }
    };
    
    this.init();
  }
  
  init() {
    // Add event listeners to UI elements
    this.updateButton = document.getElementById('update-chord');
    this.debugOutput = document.getElementById('chord-debug');
    
    if (this.updateButton) {
      this.updateButton.addEventListener('click', () => this.updateChordDiagram());
    } else {
      // For backward compatibility, add listeners to select elements
      this.chordRoot.addEventListener('change', () => this.updateChordDiagram());
      this.chordType.addEventListener('change', () => this.updateChordDiagram());
    }
    
    // Show debug info in development
    document.querySelectorAll('.debug-info').forEach(div => {
      div.style.display = 'block';
    });
    
    // Initialize with default chord - delay slightly to ensure DOM is ready
    setTimeout(() => this.updateChordDiagram(), 100);
  }
  
  updateChordDiagram() {
    try {
      const root = this.chordRoot.value;
      const type = this.chordType.value;
      
      let debugInfo = `Root: ${root}, Type: ${type}\n`;
      console.log(`Updating chord diagram for ${root} ${type}`);
      
      // Display all available chord keys for debugging
      debugInfo += `Available chord keys:\n${Object.keys(this.chordData).join(', ')}\n\n`;
      
      // Try different formats for the chord key
      let chordKey = `${root}-${type}`;
      debugInfo += `Trying chord key: ${chordKey}\n`;
      
      if (!this.chordData[chordKey]) {
        // Try alternative formats
        const alternativeKeys = [
          `${root}-${type}`,
          `${root}-${type.toLowerCase()}`
        ];
        
        debugInfo += `Chord not found with key: ${chordKey}\nTrying alternatives...\n`;
        
        // Check for specific type conversions
        if (type === 'major') chordKey = `${root}-major`;
        else if (type === 'minor') chordKey = `${root}-minor`;
        else if (type === 'maj7') chordKey = `${root}-maj7`;
        else if (type === 'min7') chordKey = `${root}-min7`;
        else {
          // Try each alternative
          for (const altKey of alternativeKeys) {
            debugInfo += `Trying: ${altKey}\n`;
            if (this.chordData[altKey]) {
              chordKey = altKey;
              debugInfo += `Found match with: ${chordKey}\n`;
              break;
            }
          }
        }
      }
      
      // Update debug display
      if (this.debugOutput) {
        this.debugOutput.textContent = debugInfo;
      }
      
      // Check if the chord exists in our data
      if (this.chordData[chordKey]) {
        debugInfo += `Success! Found chord data for ${chordKey}\n`;
        console.log(`Found chord data for ${chordKey}`);
        this.renderChordDiagram(root, type, this.chordData[chordKey]);
      } else {
        // If chord not found, display a message and create an empty diagram
        debugInfo += `Failed. No chord data available for ${chordKey}\n`;
        console.log(`Chord data not available for ${chordKey}`);
        this.chordDiagram.innerHTML = `
          <h3>${root} ${type}</h3>
          <p>Chord data not available for ${root} ${type}</p>
          <div class="guitar-diagram">
            <div class="fretboard">
              <div class="guitar-string"><div class="fret string-label">-</div><div class="fret">-</div><div class="fret">-</div><div class="fret">-</div><div class="fret">-</div><div class="fret">-</div></div>
              <div class="guitar-string"><div class="fret string-label">-</div><div class="fret">-</div><div class="fret">-</div><div class="fret">-</div><div class="fret">-</div><div class="fret">-</div></div>
              <div class="guitar-string"><div class="fret string-label">-</div><div class="fret">-</div><div class="fret">-</div><div class="fret">-</div><div class="fret">-</div><div class="fret">-</div></div>
              <div class="guitar-string"><div class="fret string-label">-</div><div class="fret">-</div><div class="fret">-</div><div class="fret">-</div><div class="fret">-</div><div class="fret">-</div></div>
              <div class="guitar-string"><div class="fret string-label">-</div><div class="fret">-</div><div class="fret">-</div><div class="fret">-</div><div class="fret">-</div><div class="fret">-</div></div>
              <div class="guitar-string"><div class="fret string-label">-</div><div class="fret">-</div><div class="fret">-</div><div class="fret">-</div><div class="fret">-</div><div class="fret">-</div></div>
            </div>
            <div class="fret-markers">
              <div class="fret-marker"></div>
              <div class="fret-marker">0</div>
              <div class="fret-marker">1</div>
              <div class="fret-marker">2</div>
              <div class="fret-marker">3</div>
              <div class="fret-marker">4</div>
            </div>
          </div>
        `;
      }
      
      // Update debug display again with final results
      if (this.debugOutput) {
        this.debugOutput.textContent = debugInfo;
      }
    } catch (error) {
      console.error('Error updating chord diagram:', error);
      if (this.debugOutput) {
        this.debugOutput.textContent = `ERROR: ${error.message}\n${error.stack}`;
      }
    }
  }
  
  renderChordDiagram(root, type, chordInfo) {
    // Clear previous diagram
    this.chordDiagram.innerHTML = '';
    
    // Create chord name display
    const chordName = document.createElement('h3');
    chordName.textContent = `${root} ${type.replace('_', ' ')}`;
    this.chordDiagram.appendChild(chordName);
    
    // Create guitar diagram container
    const guitarDiagram = document.createElement('div');
    guitarDiagram.className = 'guitar-diagram';
    
    // Create open/muted string indicators container
    const openStringIndicators = document.createElement('div');
    openStringIndicators.className = 'open-string-indicators';
    openStringIndicators.style.display = 'flex';
    openStringIndicators.style.justifyContent = 'space-around';
    openStringIndicators.style.width = '100%';
    openStringIndicators.style.marginBottom = '5px';
    
    // Add open/muted indicators for each string
    const positions = chordInfo.positions;
    
    // Add each string indicator
    for (let i = 5; i >= 0; i--) {
      const indicator = document.createElement('div');
      indicator.style.width = '24px';
      indicator.style.height = '24px';
      indicator.style.borderRadius = '50%';
      indicator.style.display = 'flex';
      indicator.style.alignItems = 'center';
      indicator.style.justifyContent = 'center';
      indicator.style.fontWeight = 'bold';
      
      if (positions[i] === 'X') {
        // Muted string
        indicator.textContent = 'X';
        indicator.style.color = '#e74c3c';  // Red for muted
      } else if (positions[i] === '0') {
        // Open string
        indicator.textContent = 'O';
        indicator.style.color = '#2ecc71';  // Green for open
      } else {
        // Fretted string - empty indicator
        indicator.textContent = '';
      }
      
      openStringIndicators.appendChild(indicator);
    }
    
    guitarDiagram.appendChild(openStringIndicators);
    
    // Create fretboard
    const fretboard = document.createElement('div');
    fretboard.className = 'fretboard';
    fretboard.style.borderTop = '4px solid #000';  // Thicker line for nut
    
    // Determine the starting fret (for barre chords or higher position chords)
    let startFret = 0;
    const fingering = chordInfo.fingering;
    
    // Find the lowest fretted position (ignoring open/muted strings)
    const frettedPositions = positions.filter(pos => pos !== 'X' && pos !== '0').map(pos => parseInt(pos));
    if (frettedPositions.length > 0) {
      const minFret = Math.min(...frettedPositions);
      // If the chord is played higher up the neck, adjust the display
      if (minFret > 3) {
        startFret = minFret - 1;
        
        // If we're starting at a higher fret, add a fret number indicator
        const fretNumIndicator = document.createElement('div');
        fretNumIndicator.className = 'fret-number-indicator';
        fretNumIndicator.style.position = 'absolute';
        fretNumIndicator.style.left = '-25px';
        fretNumIndicator.style.top = '5px';
        fretNumIndicator.style.fontSize = '12px';
        fretNumIndicator.style.padding = '2px 5px';
        fretNumIndicator.style.backgroundColor = '#fff';
        fretNumIndicator.style.border = '1px solid #888';
        fretNumIndicator.style.borderRadius = '4px';
        fretNumIndicator.textContent = `${startFret + 1}fr`;
        fretboard.style.position = 'relative';
        fretboard.appendChild(fretNumIndicator);
      }
    }
    
    // Create 6 strings with 5 frets
    for (let i = 5; i >= 0; i--) {
      const stringDiv = document.createElement('div');
      stringDiv.className = 'guitar-string';
      
      // String names (from highest to lowest pitched)
      const stringNames = ['e', 'B', 'G', 'D', 'A', 'E'];
      
      // Add string identifier
      const stringIdentifier = document.createElement('div');
      stringIdentifier.className = 'string-identifier';
      stringIdentifier.style.width = '20px';
      stringIdentifier.style.textAlign = 'center';
      stringIdentifier.style.fontSize = '12px';
      stringIdentifier.style.color = '#888';
      stringIdentifier.textContent = stringNames[5 - i];
      stringDiv.appendChild(stringIdentifier);
      
      // Create frets
      for (let j = 0; j < 4; j++) {  // Reduced to 4 frets for better display
        const fretDiv = document.createElement('div');
        fretDiv.className = 'fret';
        
        // Add string line
        const stringLine = document.createElement('div');
        stringLine.className = 'string-line';
        fretDiv.appendChild(stringLine);
        
        // Check if this position should have a finger marker
        const currentFret = startFret + j + 1;  // +1 because fret numbers start at 1
        const stringPosition = positions[i];
        
        if (stringPosition !== 'X' && stringPosition !== '0' && parseInt(stringPosition) === currentFret) {
          const marker = document.createElement('div');
          marker.className = 'finger-marker';
          marker.textContent = fingering[i] !== '0' ? fingering[i] : '';
          fretDiv.appendChild(marker);
        }
        
        stringDiv.appendChild(fretDiv);
      }
      
      fretboard.appendChild(stringDiv);
    }
    
    guitarDiagram.appendChild(fretboard);
    
    // Add fret markers below
    const fretMarkers = document.createElement('div');
    fretMarkers.className = 'fret-markers';
    fretMarkers.style.display = 'flex';
    fretMarkers.style.justifyContent = 'space-around';
    fretMarkers.style.marginTop = '5px';
    
    // Add string identifier column
    const stringIdMarker = document.createElement('div');
    stringIdMarker.className = 'fret-marker';
    stringIdMarker.style.width = '20px';  // Match width of string identifier
    fretMarkers.appendChild(stringIdMarker);
    
    // Add actual fret numbers
    for (let j = 0; j < 4; j++) {  // Reduced to 4 frets to match the diagram
      const markerDiv = document.createElement('div');
      markerDiv.className = 'fret-marker';
      markerDiv.textContent = startFret + j + 1;  // Real fret numbers (starting at 1)
      fretMarkers.appendChild(markerDiv);
    }
    
    guitarDiagram.appendChild(fretMarkers);
    
    // Add fingering legend
    const fingerLegend = document.createElement('div');
    fingerLegend.className = 'finger-legend';
    fingerLegend.style.marginTop = '15px';
    fingerLegend.style.fontSize = '0.8rem';
    fingerLegend.style.textAlign = 'center';
    fingerLegend.style.color = '#666';
    fingerLegend.innerHTML = 'Finger: 1=index, 2=middle, 3=ring, 4=pinky';
    
    guitarDiagram.appendChild(fingerLegend);
    
    this.chordDiagram.appendChild(guitarDiagram);
  }
}

// Initialize the chord library when page loads - with safety timeout
function initChordLibrary() {
  console.log('Initializing chord library...');
  try {
    window.chordLibrary = new ChordLibrary();
    console.log('Chord library initialized successfully');
  } catch (error) {
    console.error('Error initializing chord library:', error);
    
    // If DOM isn't fully ready, retry after a delay
    setTimeout(initChordLibrary, 500);
  }
}

// Start initialization with a delay to ensure DOM is ready
setTimeout(initChordLibrary, 500);