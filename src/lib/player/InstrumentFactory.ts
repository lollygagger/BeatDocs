import {BeatInstrument} from "../interfaces/NoteInterface"
// import Tone, { MembraneSynth, MetalSynth, PluckSynth, Sampler, Synth } from 'tone';
import {Monophonic} from "tone/build/esm/instrument/Monophonic";
import {MembraneSynth, MetalSynth, PluckSynth, Sampler} from "tone";

export function createSynthFromInstrument(instrument: BeatInstrument): any {
    switch(instrument.name){
        case "MetalSynth":
            return new MetalSynth(instrument.properties);
        case "PluckSynth":
            return new PluckSynth(PluckSynth.getDefaults());
        case "MembraneSynth":
            return new MembraneSynth(instrument.properties);
        case "Sampler":
            return new Sampler(instrument.properties);

        default:
            throw new Error(`Instrument type ${instrument.name} is not supported`);
    }
}