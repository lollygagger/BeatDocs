import {BeatInstrument} from "../interfaces/NoteInterface"
import * as Tone from "tone";

export function createSynthFromInstrument(instrument: BeatInstrument): any {
    switch(instrument.name.split("-")[0]){
        case "MetalSynth":
            return new Tone.MetalSynth(instrument.properties);
        case "PluckSynth":
            return new Tone.PluckSynth(instrument.properties);
        case "MembraneSynth":
            return new Tone.MembraneSynth(instrument.properties);
        case "Sampler":
            return new Tone.Sampler({
                C4: "https://drive.google.com/uc?export=download&id=1b6x7SlKDY_cFyeB8p_ahgZRQbkLP9ira"
            });
        case "Synth":
            return new Tone.Synth(instrument.properties);
        case "NoiseSynth":
            return new Tone.NoiseSynth(instrument.properties);

        default:
            throw new Error(`Instrument type ${instrument.name} is not supported`);
    }
}