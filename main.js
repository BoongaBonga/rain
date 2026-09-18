let CHARSIZE = 12;

let GRIDW = 90;
let GRIDH = 45;

let map = Array.from({length: GRIDH}, () => Array(GRIDW).fill(0));
let dropsx = [];
let dropsy = [];
let dropsTimeLeft = [];
let dropsR = [];

let DROPSPEED = 15;
const FPS = 60;
const DELTATIME = 1000/FPS;
let dropSpawnChance = 0.01;
let DROP_LIFETIME = 4000;
let DROP_WIDTH = 5;
let SQUARENESS = 2;


const standardScale = "@%#*+=:. ";
let grayScale = "@%#*+=:. ";
let grayScaleLen = grayScale.length;

squareNess.addEventListener("input", ()=>{SQUARENESS = Math.round(squareNess.value/100 * 8) + 1})
dropWidth.addEventListener("input", ()=>{DROP_WIDTH = Math.round(dropWidth.value/100 * 20) + 1})
dropSpeed.addEventListener("input", ()=>{DROPSPEED = Math.round(dropSpeed.value/100 * 50) + 1})
dropFreq.addEventListener("input", ()=>{dropSpawnChance = dropFreq.value/1000})
dropTime.addEventListener("input", ()=>{DROP_LIFETIME = Math.round(dropTime.value/100 * 5000) + 100})
userGrayScale.addEventListener("input", ()=>{
  if(userGrayScale.value == "") {
    grayScale = standardScale;
  }else{
    grayScale = userGrayScale.value; 
  }
  grayScaleLen = grayScale.length;
})
userCharSize.addEventListener("input", ()=>{CHARSIZE = Math.round(userCharSize.value/100 * 50); load();})
userBgColor.addEventListener("input", ()=>{grid.style.backgroundColor = userBgColor.value;})
userWaveColor.addEventListener("input", ()=>{document.body.style.color = userWaveColor.value;})

let settingsVisible = false;
function viewSettings() {
  if(settingsVisible){
    settings.style.visibility = "hidden";
  }else {
    settings.style.visibility = "visible";
  }
  settingsVisible = !settingsVisible;
}

function load() {
    const body = document.body;
    const rect = body.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    // Set font size
    const r = document.querySelector(":root");
    r.style.setProperty("--charSize", `${CHARSIZE}px`);

    // Number of characters that fit
    const gridW = Math.floor(width / CHARSIZE);
    const gridH = Math.floor(height / CHARSIZE);

    r.style.setProperty("--gridW", gridW);
    r.style.setProperty("--gridH", gridH);

    GRIDW = gridW;
    GRIDH = gridH;

    map = Array.from({length: GRIDH}, () => Array(GRIDW).fill(0));

    //console.log(`Grid: ${gridW} x ${gridH}`);
}

window.addEventListener("resize", load);

function resetGrid(newW, newH) {
  map = Array.from({length: newH}, () => Array(newW).fill(0));
  GRIDH=newH;
  GRIDW=newW;
}

function getPixelBrightness(w, h) {
  let max = grayScaleLen - 1; 

  const N = SQUARENESS; //higher = squarer corners

  for (let i = 0; i < dropsTimeLeft.length; i++) {
    //check whether this drop has reached this pixel
    //get distance to pixel
    let distanceX = Math.abs(dropsx[i]-w);
    let distanceY = Math.abs(dropsy[i]-h);
    let ringDistanceX = Math.abs(distanceX - dropsR[i]);
    let ringDistanceY = Math.abs(distanceY - dropsR[i]);

    const distance = Math.pow(
      Math.pow(distanceX, N) + Math.pow(distanceY, N),
      1/N
    );

    const ringDistance = Math.abs(distance - dropsR[i]);

    if(ringDistance > DROP_WIDTH) continue;

    const intensity = 
      (DROP_WIDTH - ringDistance)/DROP_WIDTH 
      * dropsTimeLeft[i]/DROP_LIFETIME;

    //color value = 
    let grayVal = Math.max(0, Math.min(grayScaleLen - 1, 
      Math.round(
        grayScaleLen - intensity * grayScaleLen
      )
    ));

    if(grayVal < max) max = grayVal;
  }
  return max;
}


function updateGrid(deltaTime) {
  let textGrid = "";
    for (let i = 0; i < map.length; i++) {
    for (let j = 0; j < map[i].length; j++) {
      textGrid += grayScale[getPixelBrightness(i, j)];
    }
    textGrid += "\n";
  }
  grid.textContent = textGrid;
} 

function randCoord() {
  return Math.round(Math.random()*(GRIDW-1));
}
function spawnDrop(x, y) {
  dropsx.push(x);
  dropsy.push(y);
  dropsR.push(0.0);
  dropsTimeLeft.push(DROP_LIFETIME + (Math.random()*500 - 250));
}
function removeDrop(i) {
  //since it's a first in - first out kinda stack due to the constant timings 
  dropsx.splice(i, 1);
  dropsy.splice(i, 1);
  dropsR.splice(i, 1);
  dropsTimeLeft.splice(i, 1);
}

function progressDrop(i, deltaTime) {
  dropsR[i] += deltaTime * DROPSPEED / 1000;
  dropsTimeLeft[i] -= deltaTime;
  if(dropsTimeLeft[i] < 0) {
    return true;
  }
  return false;
}

window.setInterval(()=>{
  //maybe spawn a drop
  if(Math.random() < dropSpawnChance) {
    spawnDrop(randCoord(), randCoord());
  }

  //progress all drops
  let removingDrops = [];
  for(let i = 0; i < dropsTimeLeft.length; i++) {
    if(progressDrop(i, DELTATIME)) {
      removingDrops.push(i);
    }
  }

  //remove drops
  for (let i = removingDrops.length - 1; i >= 0; i--) {
  removeDrop(removingDrops[i]);
}
  
  updateGrid()
}, DELTATIME);

spawnDrop(45, 45);