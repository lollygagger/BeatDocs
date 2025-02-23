import {BeatEffect, Document} from "./lib/interfaces/NoteInterface";
import {Player} from "./lib/player/Player"
import {createSynthFromInstrument} from "./lib/player/InstrumentFactory";
import {connectEffects, createEffect} from "./lib/player/EffectFactory";
import { Sequence } from "tone";

document.addEventListener('DOMContentLoaded', () => {
    const messageEl = document.getElementById("message");
    if (messageEl) {
        messageEl.textContent = "Hello from your TypeScript-powered popup!";
    }
});


chrome.runtime.sendMessage({action: "popupOpened", "url": window.location.href});


function orchestratePlay(document: Document) {
    //first parse settings and create a player object
    let player = new Player(document.attributes.tempo, document.attributes.loop)

    let sequences: Sequence<any>[] = []

    //Start creating instruments
    document.tracks.forEach((track) => {
        console.log(`Parsing track: ${track.name}`)

        console.log("Creating Instrument")
        let synth = createSynthFromInstrument(track.metadata.instrument)

        if(track.metadata.effects){
            console.log("Creating Effects")
            let effects: BeatEffect[] = []
            track.metadata.effects.forEach(effect => {
                effects.push(createEffect(effect))
            })

            console.log("Connecting Effects to Instrument")
            connectEffects(synth, effects)
        }

        console.log("Creating Sequence")
        sequences.push(player.createSequenceFromTrack(synth, track.notes))
    });

    console.log("Playing sequences")
    player.playAudio(sequences)
}