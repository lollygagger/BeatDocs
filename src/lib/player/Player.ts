import * as Tone from 'tone';
import {NoteObject} from "../interfaces/NoteInterface";
export class Player {
    public BPM: number;
    public loop: boolean;

    private defaultNote = "0:1:0"
    private oneBeatInSeconds = Tone.Time(this.defaultNote).toSeconds()

    //create longer and shorter releases based on the bpm
    private staccatoLength = this.oneBeatInSeconds - (0.05 * this.oneBeatInSeconds)
    private legatoLength = this.oneBeatInSeconds + (0.05 * this.oneBeatInSeconds)

    constructor(bpm: number = 100, loop: boolean = true) {
        this.loop = loop;
        this.BPM = bpm;
    }

    private track1Notes: NoteObject[] = [
        { type: "staccato", note: "A4" },
        { type: "legato", note: "C3" },
        { type: "normal", note: "A#4" },
        { type: "skip"},
        { type: "normal", note: "G4" }
    ];

    private track2Notes: NoteObject[] = [
        { type: "normal", note: "B4" },
        { type: "normal", note: "B3" },
        { type: "normal", note: "F#3" },
        { type: "skip"},
        { type: "normal", note: "G4" }
    ];

    public createSequenceFromTrack(synth: Tone.Synth, track: NoteObject[]): Tone.Sequence {
        // Create an array of times and corresponding actions for the sequence
        const times = track.map((noteObj, index) => index); // Assuming each note is spaced 1 beat apart
        const actions = track.map((noteObj) => {
            return (time: any) => {
                const { type, note, duration } = noteObj;

                // Handle different note types with appropriate synth calls
                if (type === 'staccato' && note) {
                    synth.triggerAttackRelease(note, this.staccatoLength, time);
                } else if (type === 'legato' && note) {
                    synth.triggerAttackRelease(note, this.legatoLength, time);
                } else if (type === 'normal' && note) {
                    synth.triggerAttackRelease(note, this.defaultNote, time);
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
            this.defaultNote
        );
    }

    public playAudio(sequenceList: Tone.Sequence[]){
        sequenceList.forEach((sequence: Tone.Sequence) => {
            sequence.loop = this.loop
            sequence.start(0);
        });
        Tone.getTransport().start();
    }

    public stopAudio(){
        Tone.getTransport().stop();
    }
}
