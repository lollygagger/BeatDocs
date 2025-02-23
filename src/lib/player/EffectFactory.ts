import {BeatEffect, BeatInstrument} from "../interfaces/NoteInterface";
import {Effect} from "tone/build/esm/effect/Effect";
import {AutoWah, Chorus, Delay, Distortion, getDestination, Reverb, Vibrato} from "tone";

export function createEffect(effect: BeatEffect): any {
    switch (effect.name) {
        case 'reverb':
            return new Reverb(effect.options).toDestination();

        case 'delay':
            return new Delay(effect.options).toDestination();

        case 'chorus':
            return new Chorus(effect.options).toDestination();

        case 'distortion':
            return new Distortion(effect.options).toDestination();

        case 'autowah':
            return new AutoWah(effect.options).toDestination();

        case 'vibrato':
            return new Vibrato(effect.options).toDestination();

        default:
            throw new Error(`Effect type ${effect.name} is not supported`);
    }
}

export function connectEffects(synth: any, effects: any[]){
    effects.reduce((lastNode, effect) => {
        lastNode.connect(effect);  // Connect the previous node to the current effect
        return effect;  // Return the current effect for the next iteration
    }, synth);  // Start with the synth and use it as the initial "lastNode"

    // Finally, connect the last effect to the destination
    getDestination().connect(effects[effects.length - 1]);
}