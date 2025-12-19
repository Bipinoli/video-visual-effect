import {drawControls} from "./dom.js";
import {setupWebGL} from "./webgl.js"

const effects = [
  {id: 1, name: 'Color-invert effect', hasStrengthControl: false},
  {id: 2, name: 'Glitch effect', hasStrengthControl: true},
  {id: 3, name: 'No effect', hasStrengthControl: false},
];
let state = { selectedEffect: 2 };


drawControls(state, effects);

await setupWebGL(document.getElementById("canvas"), "shaders/color-invert");
