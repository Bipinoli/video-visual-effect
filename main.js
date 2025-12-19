import {drawUI} from "./dom.js";
import {setupWebGL, renderVideo} from "./webgl.js"

const effects = [
  {id: "colinv", name: 'Color-invert', hasStrengthControl: false, folder: "color-invert"},
  {id: "anadis", name: 'Analog distortion', hasStrengthControl: true, folder: "analog-distortion"},
  {id: "edgdet", name: 'Edge detect', hasStrengthControl: true, folder: "edge-detect"},
  {id: "fiseye", name: 'Fish eye', hasStrengthControl: true, folder: "fish-eye"},
  {id: "poster", name: 'Posterize', hasStrengthControl: true, folder: "posterize"},
  {id: "noeffc", name: 'No effect', hasStrengthControl: false, folder: "noeffect"},
];
let stateControls = { 
  selectedEffect: "noeffc", 
  videoUrl: "./assets/doggo.mp4",
  downloadInProgress: false,
};
let statePreview = {
  canvasElement: document.getElementById("canvas"),
  videoElement: createVideoForLivePreview(stateControls.videoUrl)
};


function createVideoForLivePreview(url) {
  let video = createVideo(url, document.getElementById("canvas"));
  video.loop = true;
  video.autoplay = true;
  video.play();
  return video;
}

function createVideo(url, relatedCanvasElement) {
  const video = document.createElement("video");
  video.src = url;
  video.muted = true;
  video.playsInline = true;
  video.crossOrigin = "anonymous";
  video.addEventListener("loadedmetadata", () => {
    const width = video.videoWidth;
    const height = video.videoHeight;
    relatedCanvasElement.width = width;
    relatedCanvasElement.height = height;
  });
  return video;
}


function start() {
  const video = createVideo();
  drawUI(stateControls, statePreview, effects, effectClickCallback, downloadBtnClickCallback);
  const selectedEffect = effects.find(e => e.id == stateControls.selectedEffect);
  effectClickCallback(selectedEffect);
}


async function effectClickCallback(effect) {
  await setupWebGL(statePreview.canvasElement, `shaders/${effect.folder}`);
  renderVideo(statePreview.canvasElement, statePreview.videoElement);
}

async function downloadBtnClickCallback() { 
  stateControls.downloadInProgress = true;
  drawUI(stateControls, statePreview, effects, effectClickCallback, downloadBtnClickCallback);

  statePreview.videoElement.pause();
  statePreview.videoElement.currentTime = 0;
  statePreview.videoElement.loop = false;
  statePreview.videoElement.autoplay = false;

  const stream = statePreview.canvasElement.captureStream(30); // 30 FPS
  const recordedChunks = [];
  const mediaRecorder = new MediaRecorder(stream, { mimeType: getSupportedMimeType() });
  mediaRecorder.ondataavailable = e => {
    if (e.data.size > 0) recordedChunks.push(e.data);
  };
  statePreview.videoElement.onended = () => {
    mediaRecorder.stop();
    statePreview.videoElement.loop = true;
    statePreview.videoElement.autoplay = true;
    statePreview.videoElement.play();

    stateControls.downloadInProgress = false;
    drawUI(stateControls, statePreview, effects, effectClickCallback, downloadBtnClickCallback);
  };
  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: getSupportedMimeType() });
    const url = URL.createObjectURL(blob);
    // download automatically
    const a = document.createElement("a");
    a.href = url;
    a.download = "video_with_effect.webm";
    a.click();
    URL.revokeObjectURL(url);
  };
  mediaRecorder.start();
  statePreview.videoElement.play();
}


function getSupportedMimeType() {
  if (MediaRecorder.isTypeSupported("video/webm")) {
    return "video/webm";
  }
  return "video/mp4";
}

start();



