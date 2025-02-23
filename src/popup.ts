import {BeatEffect, Document} from "./lib/interfaces/NoteInterface";
import {Player} from "./lib/player/Player"
import {createSynthFromInstrument} from "./lib/player/InstrumentFactory";
import {connectEffects, createEffect} from "./lib/player/EffectFactory";
import { Sequence } from "tone";

// document.addEventListener('DOMContentLoaded', () => {
//     const messageEl = document.getElementById("message");
//     if (messageEl) {
//         messageEl.textContent = "Hello from your TypeScript-powered popup!";
//     }
// });


chrome.runtime.sendMessage({action: "popupOpened", "url": window.location.href});
