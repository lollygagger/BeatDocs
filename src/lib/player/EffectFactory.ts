import * as Tone from 'tone';
import {BeatEffect} from "../interfaces/NoteInterface";
import {Effect} from "tone/build/esm/effect/Effect";

function createEffect(effect: BeatEffect): any {
    switch (effect.name) {
        case 'reverb':
            return new Tone.Reverb(effect.options).toDestination();

        case 'delay':
            return new Tone.Delay(effect.options).toDestination();

        case 'chorus':
            return new Tone.Chorus(effect.options).toDestination();

        case 'distortion':
            return new Tone.Distortion(effect.options).toDestination();

        case 'autowah':
            return new Tone.AutoWah(effect.options).toDestination();

        case 'vibrato':
            return new Tone.Vibrato(effect.options).toDestination();

        default:
            throw new Error(`Effect type ${effect.name} is not supported`);
    }
}