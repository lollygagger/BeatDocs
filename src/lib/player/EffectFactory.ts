import {BeatEffect, BeatInstrument} from "../interfaces/NoteInterface";
import * as Tone from "tone";

export function createEffect(effect: BeatEffect): any {
    switch (effect.name) {
        case 'reverb':
            return new Tone.Reverb(effect.options).toDestination();

        case 'delay':
            return new Tone.Delay(effect.options).toDestination();

        case 'chorus':
            return new Tone.Chorus(effect.options).toDestination();

        case 'distortion':
            console.log('NMAKLING DIST EFFECT');
            console.log(effect.options);
            return new Tone.Distortion({distortion: 0.9}).toDestination();

        case 'autowah':
            return new Tone.AutoWah(effect.options).toDestination();

        case 'vibrato':
            return new Tone.Vibrato(effect.options).toDestination();

        case 'phaser':
            return new Tone.Phaser(effect.options).toDestination();
            
        case 'bitcrusher':
            return new Tone.BitCrusher(effect.options).toDestination();

        default:
            throw new Error(`Effect type ${effect.name} is not supported`);
    }
}

export function connectEffects(synth: any, effects: any[]){
    if (effects.length === 0) {
        return synth.toDestination();
    }
    
    let last = effects.reduce((lastNode, effect) => lastNode.connect(effect), synth);
    last.toDestination()
}