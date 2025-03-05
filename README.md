# GuitarBuddy - Mobile Web App for Musicians

GuitarBuddy is a mobile-optimized progressive web application designed to help guitarists and other musicians with essential tools for practice, learning, and performance.

## Features

- **Guitar Tuner**: Tune your guitar using your device's microphone or by playing reference tones
- **Metronome**: Keep time with a customizable metronome including different time signatures
- **Chord Library**: Visual reference for guitar chords with finger positions and fretboard diagrams
- **Scale Library**: Explore scales and modes with interactive fretboard visualizations

## Installation

### Running Locally

1. Clone this repository
2. Open the index.html file in your browser
3. For full functionality (including the tuner), you'll need to serve the app via HTTPS:
   - Use a local development server like `python -m http.server` or Live Server extension for VS Code
   - Navigate to the app in your browser

### Using as a Progressive Web App (PWA)

1. Visit the deployed version at [your-deployment-url]
2. Add to home screen when prompted (or use "Add to Home Screen" option in your browser menu)
3. The app will then be available offline and can be launched from your device's home screen

## Usage

### Guitar Tuner
- Tap "Start Listening" to use your device's microphone to detect pitch
- Alternatively, tap any string button to hear a reference tone
- The tuning indicator shows how close you are to the target pitch

### Metronome
- Adjust the tempo using the slider or +/- buttons
- Select the desired time signature
- Tap "Start" to begin the metronome

### Chord Library
- Select a root note and chord type
- View the chord diagram showing finger positions
- Finger numbers and fret positions are clearly labeled

### Scale Library
- Select a root note and scale type
- View the scale notes displayed on the fretboard
- Root notes are highlighted in red

## Browser Compatibility

The app works best in modern browsers with Web Audio API support:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Offline Use

The app uses service workers to enable offline functionality. Once loaded, you can use it without an internet connection.

## License

[MIT License](LICENSE)

## Credits

Created by [Your Name]# GuitarBuddy
