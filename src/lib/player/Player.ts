import {BeatEffect, Document, NoteObject} from "../interfaces/NoteInterface";
import {createSynthFromInstrument} from "./InstrumentFactory";
import {connectEffects, createEffect} from "./EffectFactory";
import * as Tone from 'tone';

export async function orchestratePlay(document: Document) {
    //first parse settings and create a player object
    let player = new Player(document.attributes.tempo, document.attributes.loop)

    let sequences: Tone.Part<any>[] = []

    //Start creating instruments
    document.tracks.forEach((track) => {
        console.log(`Parsing track: ${track.name}`)

        let synth = createSynthFromInstrument(track.metadata.instrument).toDestination()

        if (track.metadata.effects) {
            console.log("Creating Effects")
            let effects: any[] = []
            track.metadata.effects.forEach(effect => {
                if (effect.name !== '') {
                    effects.push(createEffect(effect))
                }
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

    public createSequenceFromTrack(synth: any, track: NoteObject[]): Tone.Part {
        let currentTime = 0; // Initialize the current time to zero

        // Create an array to hold the scheduled events
        const events = track.map((noteObj) => {
            const { type, note, duration } = noteObj;

            // Determine the duration of the note
            let noteDuration;
            if (type === 'staccato') {
                noteDuration = `0:2:0`;
            } else if (type === 'legato') {
                noteDuration = `0:${this.legatoLength}:0`;
            } else if (type === 'continuous' && duration) {
                noteDuration = `0:${duration}:0`; // Use the provided duration
            } else {
                noteDuration = this.defaultNote;
            }

            // Create the event object
            const event = {
                time: currentTime,
                note,
                duration: noteDuration,
                type
            };

            // Update the current time for the next note
            currentTime += Tone.Time(noteDuration).toSeconds();

            return event;
        });
        
        // Create and return the Tone.Sequence
        const part = new Tone.Part((time, event) => {
            const { note, duration } = event;

            if (!note) return;

            console.log(`Playing ${note} at ${time} for ${duration}`);
            console.log(synth);

            if (synth instanceof Tone.NoiseSynth) {
                // Trigger the note on the synth
                synth.triggerAttackRelease(duration, time);
            } else {
                // Trigger the note on the synth
                synth.triggerAttackRelease(note, duration, time);
            }
        }, events);


        part.loopEnd = currentTime; // Set the loop end to the total duration

        return part;
    }
    
    public playAudio(sequenceList: Tone.Part[]) {
        Tone.getTransport().bpm.value = this.BPM;
        Tone.loaded().then(() => {
            sequenceList.forEach((part: Tone.Part) => {
                part.loop = this.loop
                part.start(0);
            });
        });
        Tone.getTransport().start();

    }

    public static stopAudio() {
        Tone.getTransport().stop();
    }
}
