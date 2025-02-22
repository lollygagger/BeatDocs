import {Note} from "tone/build/esm/core/type/NoteUnits";

export interface Document {
    attributes: DocAttributes
    tracks: Track[]
}

export interface NoteObject {
    type: NoteType;
    note?: string;
    duration?: number; // Represents duration as string, "3" for 3 beats
}

export type NoteType = 'staccato' | 'legato' | 'continuous' | 'normal' | 'skip'

export interface Track {
    name: string;
    metadata: Metadata;
    notes: NoteObject[];
}

export interface Metadata {
    instrument: BeatInstrument;
    effects: BeatEffect[];
}

export interface BeatInstrument {
    name: string; // e.g., "MetalSynth"
    properties:  Record<string, any>;
}

export interface BeatEffect {
    name: string; // e.g., "reverb"
    options: Record<string, any>;
}

export interface DocAttributes {
    tempo: number // in BPM
    octave: number
    loop: boolean
}
