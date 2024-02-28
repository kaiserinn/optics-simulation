let CANVAS_WIDTH = window.innerWidth;
let CANVAS_HEIGHT = window.innerHeight;
let X_ORIGIN = CANVAS_WIDTH / 2;
let Y_ORIGIN = CANVAS_HEIGHT / 2;
const SCALE = 50;

let f;
let d_o;
let d_i;
let h_o;
let h_i;

let sim;
let type;

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const ctx = canvas.getContext("2d");

/** @type {HTMLInputElement} Slider untuk jarak objek ke titik 0 */
const objDistance = document.getElementById("distance-slider");
objDistance.max = CANVAS_WIDTH / 2 / SCALE;

/** @type {HTMLInputElement} Input Box untuk jarak objek ke titik 0 */
const objDistanceInput = document.getElementById("distance-input");

/** @type {HTMLInputElement} Slider untuk tinggi objek */
const objHeight = document.getElementById("height-slider");
objHeight.max = CANVAS_HEIGHT / 2 / SCALE;

/** @type {HTMLInputElement} Input Box untuk tinggi objek */
const objHeightInput = document.getElementById("height-input");

const focalLength = document.getElementById("focal-slider");
focalLength.max = CANVAS_WIDTH / 2 / SCALE;

const focalLengthInput = document.getElementById("focal-input");

const inputElements = document.querySelectorAll('input[type="range"]');
for (let i = 0; i < inputElements.length; i++) {
  inputElements[i].addEventListener("input", () => {
    objDistanceInput.value = objDistance.value;
    objHeightInput.value = objHeight.value;
    focalLengthInput.value = focalLength.value;
    update();
  })
}

const typeSelections = document.querySelectorAll("input[name='type']");
for (let i = 0; i < typeSelections.length; i++) {
  typeSelections[i].addEventListener("input", () => {
    update();
  })
}

const simSelections = document.querySelectorAll("input[name='sim']");
for (let i = 0; i < typeSelections.length; i++) {
  simSelections[i].addEventListener("input", () => {
    update();
  })
}

const menu = document.getElementById('checkbox-menu');
menu.addEventListener("input", () => update());

/**
 * @param {CanvasRenderingContext2D} ctx 2d rendering context
 * @param {number} x1 Titik x awal
 * @param {number} y1 Titik y awal
 * @param {number} x2 Titik x akhir
 * @param {number} y2 Titik y akhir
 * @param {{color: string, style: "normal" | "dashed"}} [{color="black", style="normal"}={color:"black", style:"normal"}]
 */
const dda = (
  ctx,
  x1,
  y1,
  x2,
  y2,
  {color="black", style="normal"} = {color: "black", style: "normal"}
) => {
  x1 = X_ORIGIN + x1;
  y1 = Y_ORIGIN - y1;
  x2 = X_ORIGIN + x2;
  y2 = Y_ORIGIN - y2;

  const dx = x2 - x1; 
  const dy = y2 - y1; 
  const step = Math.max(Math.abs(dx), Math.abs(dy));

  const xIncrement = dx / step; 
  const yIncrement = dy / step; 

  ctx.fillStyle = color;

  let j = 0;
  let noPixel = false;
  for (let i = 0; i < step; i++) { 
    x1 += xIncrement; 
    y1 += yIncrement; 
    if (style === "dashed") {
      if (j % 10 === 0) {
        noPixel = !noPixel;
      }
      j++
      if (noPixel) {
        continue
      }
    }
    ctx.fillRect(x1, y1, 1, 1);
    j++
  }
}; 


/**
 * @param {CanvasRenderingContext2D} ctx 2d rendering context
 * @param {number} x1 Titik x awal
 * @param {number} y1 Titik y awal
 * @param {number} x2 Titik x akhir
 * @param {number} y2 Titik y akhir
 * @param {{color: string, isVirtual: bool, style: "normal" | "dashed"}} [{color="black", isVirtual=false, style="normal"}={color:"black", isVirtual:false, style:"normal"}]
 */
const ddaRay = (
  ctx,
  x1,
  y1,
  x2,
  y2,
  {color="black", style="normal", isVirtual=false} = {
    color: "black",
    style: "normal",
    isVirtual: false,
  }
) => {
  x1 = X_ORIGIN + x1;
  y1 = Y_ORIGIN - y1;
  x2 = X_ORIGIN + x2;
  y2 = Y_ORIGIN - y2;

  const dx = x2 - x1; 
  const dy = y2 - y1; 
  const step = Math.max(Math.abs(dx), Math.abs(dy));

  const xIncrement = dx / step; 
  const yIncrement = dy / step; 

  ctx.fillStyle = color;

  let i = 0;
  let noPixel = false;
  while (true) {
    if (!isVirtual) {
      if (x1 <= 0 || y1 <= 0) { break; }
    } else {
      if (x1 >= CANVAS_WIDTH || y1 >= CANVAS_HEIGHT) { break; }
    }

    x1 += xIncrement; 
    y1 += yIncrement; 
    if (style === "dashed") {
      if (i % 10 === 0) {
        noPixel = !noPixel;
      }
      i++
      if (noPixel) {
        continue;
      }
    }
    ctx.fillRect(x1, y1, 1, 1);
    i++
  }
}; 

// fungsi sementara
const ddaRayMod = (
  ctx,
  x1,
  y1,
  x2,
  y2,
  {color="black", style="normal", isVirtual=false} = {
    color: "black",
    style: "normal",
    isVirtual: false,
  }
) => {
  x1 = X_ORIGIN + x1;
  y1 = Y_ORIGIN - y1;
  x2 = X_ORIGIN + x2;
  y2 = Y_ORIGIN - y2;

  const dx = x2 - x1; 
  const dy = y2 - y1; 
  const step = Math.max(Math.abs(dx), Math.abs(dy));

  const xIncrement = dx / step; 
  const yIncrement = dy / step; 

  ctx.fillStyle = color;

  let i = 0;
  let noPixel = false;
  while (true) {
    if (!isVirtual) {
      if (x1 <= 0 || y1 <= 0) { break; }
    } else {
      if (x1 >= CANVAS_WIDTH || y1 >= CANVAS_HEIGHT) { break; }
    }

    if (Math.abs(x1) <= Math.abs(x2) || Math.abs(y1) <= Math.abs(y2)) {
      if (style === "normal") {
        style = "dashed";
      } else if (style === "dashed") {
        style = "normal";
      }
    }

    x1 += xIncrement; 
    y1 += yIncrement; 
    if (style === "dashed") {
      if (i % 10 === 0) {
        noPixel = !noPixel;
      }
      i++
      if (noPixel) {
        continue;
      }
    }
    ctx.fillRect(x1, y1, 1, 1);
    i++
  }
};

/**
 * @param {CanvasRenderingContext2D} ctx 2d rendering context
 */
const drawBase = (ctx) => {
  // principal line
  dda(ctx, -CANVAS_WIDTH/2, 0, CANVAS_WIDTH/2, 0);

  dda(ctx, 0, -CANVAS_HEIGHT/2, 0, CANVAS_HEIGHT+100);
}

/**
 * @param {CanvasRenderingContext2D} ctx 2d rendering context
 */
const drawObject = (ctx) => {
  dda(ctx, -d_o*SCALE, 0, -d_o*SCALE, h_o*SCALE, {color:"red"});
  dda(ctx, (-0.3*h_o*SCALE) + (-d_o*SCALE), 0.8*h_o*SCALE, 0.3*h_o*SCALE + (-d_o*SCALE), 0.8*h_o*SCALE, {color:"red"});
  dda(ctx, (-0.3*h_o*SCALE) + (-d_o*SCALE), 0.8*h_o*SCALE, -d_o*SCALE, h_o*SCALE, {color:"red"});
  dda(ctx, 0.3*h_o*SCALE + (-d_o*SCALE), 0.8*h_o*SCALE, -d_o*SCALE, h_o*SCALE, {color:"red"});
  dda(ctx, (-0.3*h_o*SCALE) + (-d_o*SCALE), 0.8*h_o*SCALE, -d_o*SCALE, 0, {color:"red"});
  dda(ctx, 0.3*h_o*SCALE + (-d_o*SCALE), 0.8*h_o*SCALE, -d_o*SCALE, 0, {color:"red"});
}

/**
 * @param {CanvasRenderingContext2D} ctx 2d rendering context
 */
const drawImage = (ctx) => {
  dda(ctx, -d_i*SCALE, 0, -d_i*SCALE, h_i*SCALE, {color:"blue"});
  dda(ctx, (-0.3*h_i*SCALE) + (-d_i*SCALE), 0.8*h_i*SCALE, 0.3*h_i*SCALE + (-d_i*SCALE), 0.8*h_i*SCALE, {color:"blue"});
  dda(ctx, (-0.3*h_i*SCALE) + (-d_i*SCALE), 0.8*h_i*SCALE, -d_i*SCALE, h_i*SCALE, {color:"blue"});
  dda(ctx, 0.3*h_i*SCALE + (-d_i*SCALE), 0.8*h_i*SCALE, -d_i*SCALE, h_i*SCALE, {color:"blue"});
  dda(ctx, (-0.3*h_i*SCALE) + (-d_i*SCALE), 0.8*h_i*SCALE, -d_i*SCALE, 0, {color:"blue"});
  dda(ctx, 0.3*h_i*SCALE + (-d_i*SCALE), 0.8*h_i*SCALE, -d_i*SCALE, 0, {color:"blue"});
}

/**
 * @param {CanvasRenderingContext2D} ctx 2d rendering context
 */
const drawFocal = (ctx) => {
  ctx.fillStyle = "black";
  ctx.fillRect(X_ORIGIN-f*SCALE-2, Y_ORIGIN-2, 4, 4);

  if (sim === -1) {
    ctx.fillRect(X_ORIGIN+f*SCALE-2, Y_ORIGIN-2, 4, 4);
  }
}

/**
 * @param {CanvasRenderingContext2D} ctx 2d rendering context
 */
const drawCurvature = (ctx) => {
  ctx.fillStyle = "black";
  ctx.fillRect(X_ORIGIN-f*2*SCALE-2, Y_ORIGIN-2, 4, 4);

  if (sim === -1) {
    ctx.fillRect(X_ORIGIN+f*2*SCALE-2, Y_ORIGIN-2, 4, 4);
  }
}

window.addEventListener("resize", () => { CANVAS_WIDTH = window.innerWidth;
  CANVAS_HEIGHT = window.innerHeight;
  X_ORIGIN = CANVAS_WIDTH / 2;
  Y_ORIGIN = CANVAS_HEIGHT / 2;

  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  update();
})

const update = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const menu = document.getElementById('checkbox-menu');
  const label = document.querySelector('.menu > label');
  const buttonsContainerEl = document.getElementsByClassName('buttons-container');
  if (menu.checked) {
    buttonsContainerEl[0].style.display = "flex";
    label.innerHTML = "x";
  } else {
    buttonsContainerEl[0].style.display = "none";
    label.innerHTML = "=";
  }

  const selectedSim = document.querySelector("input[name='sim']:checked");
  const selectedType = document.querySelector("input[name='type']:checked");
  sim = Number(selectedSim.value);
  type = Number(selectedType.value);

  f = Number(selectedType.value) * Number(focalLength.value);
  d_o = Number(objDistance.value);
  h_o = Number(objHeight.value);

  d_i = 1 / (1/f - 1/ (Number(selectedSim.value) * d_o));
  h_i = (-d_i / (Number(selectedSim.value) * d_o)) * h_o;

  drawBase(ctx);
  drawObject(ctx);
  drawImage(ctx);
  drawFocal(ctx);
  drawCurvature(ctx);
  drawLabels(ctx);
  
  if (Number(selectedSim.value) === 1) {
    drawRay(ctx);
  } else {
    drawRayLens(ctx);
  }
}

/**
 * @param {CanvasRenderingContext2D} ctx 2d rendering context
 */
const drawRay = (ctx) => {
  const objX = -d_o * SCALE;
  const objY = h_o * SCALE;
  const imgX = -d_i * SCALE;
  const imgY = h_i * SCALE;
  const focalPos = -f * SCALE;

  // rule 1
  if (f > 0) {
    dda(ctx, -CANVAS_WIDTH/2, objY, 0, objY, {color:"green"});
    ddaRay(ctx, 0, objY, focalPos, 0, {color:"green"});
    if (h_i > 0) {
      ddaRay(ctx, 0, objY, imgX, imgY, {color:"green", style:"dashed"});
    }
  } else {
    dda(ctx, -CANVAS_WIDTH/2, objY, 0, objY, {color:"green"});
    ddaRay(ctx, 0, objY, focalPos, 0, {color:"green", isVirtual:true, style:"dashed"});
    ddaRayMod(ctx, focalPos, 0, 0, objY, {color:"green", style:"dashed"});
  }

  //rule 2
  // ddaRay(ctx, objX, objY, 2*focalPos, 0, {color:"orange", isVirtual:true});
  // if (h_i < 0) {
  //   ddaRay(ctx, imgX, imgY, 2*focalPos, 0, {color:"orange", isVirtual:false});
  // } else {
  //   ddaRay(ctx, imgX, imgY, 2*focalPos, 0, {color:"orange", isVirtual:true});
  // }

  // rule 3
  if (f !== d_o) {
    dda(ctx, -CANVAS_WIDTH/2, imgY, 0, imgY, {color:"purple"});
    if (h_i < 0) {
      ddaRay(ctx, 0, imgY, focalPos, 0, {color:"purple"});
    } else if (h_i > 0) {
      dda(ctx, 0, imgY, CANVAS_WIDTH/2, imgY, {color:"purple", style:"dashed"});
      if (f > 0) {
        ddaRay(ctx, 0, imgY, focalPos, 0, {color:"purple", isVirtual:true});
      } else {
        ddaRay(ctx, 0, imgY, objX, objY, {color:"purple"});
      }
    }
  }

  // rule 4
  // if (d_o !== 0) {
  //   ddaRay(ctx, 0, 0, objX, objY, {color:"teal"});
  //   if (d_i >= 0) {
  //     ddaRay(ctx, 0, 0, imgX, imgY, {color:"teal"});
  //   } else {
  //     // ddaRay(ctx, 0, 0, -d_i*SCALE, h_i*SCALE, {color:"teal", style:"dashed"});
  //   }
  // }
}

const drawRayLens = (ctx) => {
  const objX = -d_o * SCALE;
  const objY = h_o * SCALE;
  const imgX = -d_i * SCALE;
  const imgY = h_i * SCALE;
  const focalPos = -f * SCALE;

  // rule 1
  if (f !== d_o) {
    dda(ctx, -CANVAS_WIDTH/2, objY, 0, objY, {color:"green"});
    if (type === -1) {
      ddaRay(ctx, 0, objY, focalPos, 0, {color:"green", isVirtual:true});
      // ddaRay(ctx, 0, objY, imgX, imgY, {color:"green", isVirtual:true});
    } else {
      ddaRay(ctx, 0, objY, focalPos, 0, {color:"green", isVirtual:true});
      ddaRay(ctx, focalPos, 0, 0, objY, {color:"green"})
    }
  }

  // rule 2
  // ddaRay(ctx, objX, objY, 0, 0, {color:"teal", isVirtual:true});
  // ddaRay(ctx, imgX, imgY, 0, 0, {color:"teal", isVirtual:true});

  // rule 3
  if (type === -1) {
    dda(ctx, CANVAS_WIDTH/2, imgY, 0, imgY, {color:"purple"});
    ddaRay(ctx, 0, imgY, -focalPos, 0, {color:"purple"});
    if (d_i > 0) {
      dda(ctx, -CANVAS_WIDTH/2, imgY, 0, imgY, {color:"purple"});
    } 
  } else {
    if (d_o !== 0) {
      dda(ctx, CANVAS_WIDTH/2, imgY, 0, imgY, {color:"purple"});
      dda(ctx, -CANVAS_WIDTH/2, imgY, 0, imgY, {color:"purple"});
      ddaRay(ctx, 0, imgY, objX, objY, {color:"purple"});
    } else if (d_o === 0) {
      dda(ctx, CANVAS_WIDTH/2, objY, 0, objY, {color:"purple"});
      dda(ctx, -CANVAS_WIDTH/2, objY, 0, objY, {color:"purple"});
    }
  }
}

const drawLabels = (ctx) => {
  const objX = X_ORIGIN - d_o * SCALE;
  const objY = Y_ORIGIN - h_o * SCALE;
  const imgX = X_ORIGIN - d_i * SCALE;
  const imgY = Y_ORIGIN - h_i * SCALE;
  const focalPos = X_ORIGIN - f * SCALE;
  const curvaturePos = X_ORIGIN - f*2 * SCALE;

  const fontSize = 14;
  ctx.font = `${fontSize}px JetBrainsMono Nerd`;
  ctx.fillText("Objek", objX, objY);
  ctx.fillText(d_o, objX, Y_ORIGIN+fontSize);
  ctx.fillText(h_o, X_ORIGIN, objY);

  ctx.fillText("Bayangan", imgX, imgY);
  ctx.fillText(Math.round(d_i*100)/100, imgX, Y_ORIGIN+fontSize);
  ctx.fillText(Math.round(h_i*100)/100, X_ORIGIN, imgY);

  ctx.fillText("Fokus", focalPos, Y_ORIGIN);
  ctx.fillText(f, focalPos, Y_ORIGIN+fontSize);
  if (sim === -1) {
    ctx.fillText("Fokus", X_ORIGIN + f * SCALE, Y_ORIGIN);
    ctx.fillText(-f, X_ORIGIN + f * SCALE, Y_ORIGIN+fontSize);
  }

  ctx.fillText("Kurvatur", curvaturePos, Y_ORIGIN);
  if (sim === -1) {
    ctx.fillText("Kurvatur", X_ORIGIN + f*2 * SCALE, Y_ORIGIN);
  }
}

update();


