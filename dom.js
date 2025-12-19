export function drawControls(state, effects, clickCallback) {
  const parent = document.getElementById('effect-btns');
  parent.replaceChildren();
  effects.forEach(effect => {
    const btn = buildEffectBtn(effect, state);
    btn.addEventListener("click", async () => {
      await clickCallback(effect);
      state = stateManager(state, effect);
      drawControls(state, effects, clickCallback);
    });
    parent.appendChild(btn);
  });  
  const selectedEffect = effects.find(e => e.id == state.selectedEffect);
  const strengthControls = document.getElementById('strength-controls');
  if (selectedEffect.hasStrengthControl) {
    strengthControls.style.display = 'block';
  } else {
    strengthControls.style.display = 'none';
  }
}


function buildEffectBtn(effect, state) {
  const btn = document.createElement("div");
  btn.innerText = effect.name;
  btn.classList.add("btn");
  btn.classList.add("effect-btn");
  if (effect.id == state.selectedEffect) {
    btn.classList.add("selected-btn");
  }
  return btn;
}


function stateManager(state, selectedEffect) {
  return { selectedEffect: selectedEffect.id };
}
