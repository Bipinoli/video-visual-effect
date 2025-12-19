import {drawControls} from "./dom.js";
import {setupWebGL, renderVideo} from "./webgl.js"

const effects = [
  {id: "colinv", name: 'Color-invert', hasStrengthControl: false, folder: "color-invert"},
  {id: "anadis", name: 'Analog distortion', hasStrengthControl: true, folder: "analog-distortion"},
  {id: "edgdet", name: 'Edge detect', hasStrengthControl: true, folder: "edge-detect"},
  {id: "fiseye", name: 'Fish eye', hasStrengthControl: true, folder: "fish-eye"},
  {id: "poster", name: 'Posterize', hasStrengthControl: true, folder: "posterize"},
  {id: "noeffc", name: 'No effect', hasStrengthControl: false, folder: "noeffect"},
];
let state = { 
  selectedEffect: "noeffc", 
  canvasElement: document.getElementById("canvas"), 
  videoElement: getVideo("./assets/doggo.mp4") 
};


function getVideo(src) {
  const video = document.createElement("video");
  video.src = src;
  video.autoplay = true;
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.crossOrigin = "anonymous";
  video.addEventListener("loadedmetadata", () => {
    const width = video.videoWidth;
    const height = video.videoHeight;
    state.canvasElement.width = width;
    state.canvasElement.height = height;
  });
  video.play();
  return video;
}

async function clickCallback(effect) {
  await setupWebGL(state.canvasElement, `shaders/${effect.folder}`);
  renderVideo(state.canvasElement, state.videoElement);
}


function start() {
  drawControls(state, effects, clickCallback);
  const selectedEffect = effects.find(e => e.id == state.selectedEffect);
  clickCallback(selectedEffect);
}

start();



