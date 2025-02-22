// src/scratch.ts
import * as Tone from 'tone';

// Function to play a test tone
const playTone = () => {
    const synth = new Tone.Synth().toDestination();
    synth.triggerAttackRelease('C4', '8n'); // Plays a C4 note for an eighth note duration
    console.log('Playing a test tone!');
}

// Wait for the document to be ready, then bind a click to play the tone
document.addEventListener('click', async () => {
    await Tone.start();  // This starts the audio context
    playTone();
});
