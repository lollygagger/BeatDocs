import {BeatEffect, Document, NoteObject} from "../interfaces/NoteInterface";
import {createSynthFromInstrument} from "./InstrumentFactory";
import {connectEffects, createEffect} from "./EffectFactory";
import * as Tone from 'tone';

export async function orchestratePlay(document: Document) {
    //first parse settings and create a player object
    let player = new Player(document.attributes.tempo, document.attributes.loop)
    
    let sequences: Tone.Sequence<any>[] = []
    
    //Start creating instruments
    document.tracks.forEach((track) => {
        console.log(`Parsing track: ${track.name}`)
        
    let synth = createSynthFromInstrument(track.metadata.instrument).toDestination()

        if(track.metadata.effects){
            console.log("Creating Effects")
            let effects: any[] = []
            track.metadata.effects.forEach(effect => {
                effects.push(createEffect(effect))
            })
            
            if (effects.length !== 0) {
                console.log("Connecting Effects to Instrument")
                connectEffects(synth, effects)
            }
        }

        console.log("Creating Sequence")
        sequences.push(player.createSequenceFromTrack(synth, track.notes))
    });

    console.log("Playing sequences")
    player.playAudio(sequences)
}

export class Player {
    public BPM: number;
    public loop: boolean;

    private defaultNote = "0:1:0"
    private oneBeatInSeconds = 60 / Tone.getTransport().bpm.value

    //create longer and shorter releases based on the bpm
    private staccatoLength = this.oneBeatInSeconds - (0.05 * this.oneBeatInSeconds)
    private legatoLength = this.oneBeatInSeconds + (0.05 * this.oneBeatInSeconds)

    constructor(bpm: number = 100, loop: boolean = true) {
        this.loop = loop;
        this.BPM = bpm;
    }

    public createSequenceFromTrack(synth: any, track: NoteObject[]): Tone.Sequence {
        // Create an array of times and corresponding actions for the sequence
        const times = track.map((noteObj, index) => index); // Assuming each note is spaced 1 beat apart
        const actions = track.map((noteObj) => {
            return (time: any) => {
                const { type, note, duration } = noteObj;
                
                if (note === undefined) return;
                
                console.log(`Playing ${note} at ${time}`);

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
        Tone.getTransport().bpm.value = this.BPM;
        sequenceList.forEach((sequence: Tone.Sequence) => {
            sequence.loop = this.loop
            sequence.start(0);
        });
        Tone.getTransport().start();
    }

    public static stopAudio(){
        Tone.getTransport().stop();
    }
}
