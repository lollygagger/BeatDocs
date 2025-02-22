import * as Tone from 'tone';

const BPM = 100

const defaultNote = "0:1:0"
const oneBeatInSeconds = Tone.Time(defaultNote).toSeconds()

//create longer and shorter releases based on the bpm
const staccatoLength = oneBeatInSeconds - (0.05 * oneBeatInSeconds)
const legatoLength = oneBeatInSeconds + (0.05 * oneBeatInSeconds)

console.log("Legato release: " + (legatoLength - oneBeatInSeconds))

const track1Notes: NoteObject[] = [
    { type: "staccato", note: "A4" },
    { type: "legato", note: "C3" },
    { type: "normal", note: "A#4" },
    { type: "skip"},
    { type: "normal", note: "G4" }
];

const track2Notes: NoteObject[] = [
    { type: "normal", note: "B4" },
    { type: "normal", note: "B3" },
    { type: "normal", note: "F#3" },
    { type: "skip"},
    { type: "normal", note: "G4" }
];

function createSequenceFromTrack(synth: Tone.Synth, track: NoteObject[]): Tone.Sequence {
    // Create an array of times and corresponding actions for the sequence
    const times = track.map((noteObj, index) => index); // Assuming each note is spaced 1 beat apart
    const actions = track.map((noteObj) => {
        return (time: any) => {
            const { type, note, duration } = noteObj;

            // Handle different note types with appropriate synth calls
            if (type === 'staccato' && note) {
                synth.triggerAttackRelease(note, staccatoLength, time);
            } else if (type === 'legato' && note) {
                synth.triggerAttackRelease(note, legatoLength, time);
            } else if (type === 'normal' && note) {
                synth.triggerAttackRelease(note, defaultNote, time);
            } else if (type === 'continuous' && note && duration) {
                synth.triggerAttackRelease(note, `0:${duration}:0`, time);
            } else if (type === 'skip') {
                return;
            }
        };
    });

    // Create and return the Tone.Sequence
    return new Tone.Sequence(
        (time: any, index: number) => actions[index](time), // Call the action for each event based on its index
        times,
        defaultNote
    );
}

function playAudio(sequenceList: Tone.Sequence[]){
    sequenceList.forEach((sequence: Tone.Sequence) => {
        sequence.start(0);
    });
    Tone.getTransport().start();
}
