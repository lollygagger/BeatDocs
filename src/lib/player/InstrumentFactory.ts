import {BeatInstrument} from "../interfaces/NoteInterface"
import * as Tone from "tone";
// import Tone, { MembraneSynth, MetalSynth, PluckSynth, Sampler, Synth } from 'tone';

export function createSynthFromInstrument(instrument: BeatInstrument): any {
    switch(instrument.name){
        case "MetalSynth":
            return new Tone.MetalSynth(instrument.properties);
        case "PluckSynth":
            return new Tone.PluckSynth();
        case "MembraneSynth":
            return new Tone.MembraneSynth(instrument.properties);
        case "Sampler":
            return new Tone.Sampler(instrument.properties);

        default:
            throw new Error(`Instrument type ${instrument.name} is not supported`);
    }
}