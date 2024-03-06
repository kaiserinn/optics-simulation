let CANVAS_WIDTH = window.innerWidth;
let CANVAS_HEIGHT = window.innerHeight;
let X_ORIGIN = CANVAS_WIDTH / 2;
let Y_ORIGIN = CANVAS_HEIGHT / 2;
let SCALE = 50;

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

/** @type {HTMLInputElement} Slider untuk tinggi objek */
const objHeight = document.getElementById("height-slider");

const focalLength = document.getElementById("focal-slider");

const inputElements = document.querySelectorAll('input[type="range"]');
for (let i = 0; i < inputElements.length; i++) {
  inputElements[i].addEventListener("input", () => {
    update();
  });
}

const typeSelections = document.querySelectorAll("input[name='type']");
for (let i = 0; i < typeSelections.length; i++) {
  typeSelections[i].addEventListener("input", () => {
    update();
  });
}

const simSelections = document.querySelectorAll("input[name='sim']");
for (let i = 0; i < typeSelections.length; i++) {
  simSelections[i].addEventListener("input", () => {
    update();
  });
}

const objectSelections = document.querySelectorAll("input[name='object']");
for (let i = 0; i < typeSelections.length; i++) {
  objectSelections[i].addEventListener("input", () => {
    update();
  });
}

const menu = document.getElementById("checkbox-menu");
menu.addEventListener("input", () => update());

const resetButton = document.getElementById("reset-button");
resetButton.addEventListener("click", () => {
  SCALE = 50;
  canvas.style.setProperty("--scale", SCALE + "px");
  X_ORIGIN = CANVAS_WIDTH / 2;
  Y_ORIGIN = CANVAS_HEIGHT / 2;
  update();
});

document.addEventListener("wheel", (e) => {
  SCALE = Math.max(SCALE - e.deltaY / 10, 10);
  canvas.style.setProperty("--scale", SCALE + "px");
  update();
});

const evCache = [];
let prevDiff = -1;

canvas.addEventListener("pointerdown", (e) => {
  zoomDown(e);
  pointerdownHandler(e);
});

canvas.addEventListener("pointermove", (e) => {
  zoomMove(e);
  pointermoveHandler(e);
});

canvas.addEventListener("pointerup", (e) => {
  zoomUp(e);
  pointerupHandler();
});

/**
 * @param {PointerEvent} ev
 */
const zoomDown = (ev) => {
  evCache.push(ev);
};

/**
 * @param {PointerEvent} ev
 */
const zoomMove = (ev) => {
  for (var i = 0; i < evCache.length; i++) {
    if (ev.pointerId == evCache[i].pointerId) {
      evCache[i] = ev;
      break;
    }
  }

  if (evCache.length === 2) {
    const curDiff = Math.sqrt(
      Math.pow(evCache[1].clientX - evCache[0].clientX, 2) + Math.pow(evCache[1].clientY - evCache[0].clientY, 2)
    );
    if (prevDiff > 0) {
      if (curDiff > prevDiff) {
        SCALE = Math.min(SCALE + 2, 150);
        canvas.style.setProperty("--scale", SCALE + "px");
        update();
      }
      if (curDiff < prevDiff) {
        SCALE = Math.max(SCALE - 2, 10);
        canvas.style.setProperty("--scale", SCALE + "px");
        update();
      }
    }
    prevDiff = curDiff;
  }
};

/**
 * @param {PointerEvent} ev
 */
const zoomUp = (ev) => {
  removeEvent(ev);
  if (evCache.length < 2) {
    prevDiff = -1;
  }
};

/**
 * @param {PointerEvent} ev
 */
function removeEvent(ev) {
  const index = evCache.findIndex((cachedEv) => cachedEv.pointerId === ev.pointerId);
  evCache.splice(index, 1);
}

canvas.onpointercancel = zoomUp;
canvas.onpointerout = zoomUp;
canvas.onpointerleave = zoomUp;

let posX = 0;
let posY = 0;
let isHolding = {
  focal: false,
  invertFocal: false,
  object: false,
  canvas: false,
  controls: false,
};

/**
 * @param {PointerEvent} e
 */
const pointermoveHandler = (e) => {
  const dPosX = e.clientX - posX;
  const dPosY = e.clientY - posY;
  posX = e.clientX;
  posY = e.clientY;

  if (isAroundFocal(posX, posY) || (isAroundInvertFocal(posX, posY) && sim === -1) || isAroundObject(posX, posY)) {
    canvas.style.cursor = "grab";
  } else {
    canvas.style.cursor = "default";
  }

  if (isHolding.focal) {
    canvas.style.cursor = "grabbing";
    if (type === 1) {
      focalLength.value = (X_ORIGIN - posX) / SCALE;
    } else {
      focalLength.value = (posX - X_ORIGIN) / SCALE;
    }
    update();
    return;
  }

  if (sim === -1) {
    if (isHolding.invertFocal) {
      canvas.style.cursor = "grabbing";
      if (type === 1) {
        focalLength.value = (posX - X_ORIGIN) / SCALE;
      } else {
        focalLength.value = (X_ORIGIN - posX) / SCALE;
      }
      update();
      return;
    }
  }

  if (isHolding.object) {
    canvas.style.cursor = "grabbing";
    objDistance.value = (X_ORIGIN - posX) / SCALE;
    objHeight.value = (Y_ORIGIN - posY) / SCALE;
    update();
    return;
  }

  if (isHolding.canvas && evCache.length < 2) {
    X_ORIGIN += dPosX;
    Y_ORIGIN += dPosY;
    update();
  }
};

/**
 * @param {PointerEvent} e
 */
const pointerdownHandler = (e) => {
  posX = e.clientX;
  posY = e.clientY;

  if (isAroundFocal(posX, posY)) {
    isHolding.focal = true;
    canvas.style.cursor = "grabbing";
  }
  if (isAroundInvertFocal(posX, posY)) {
    isHolding.invertFocal = true;
    canvas.style.cursor = "grabbing";
  }
  if (isAroundObject(posX, posY)) {
    isHolding.object = true;
    canvas.style.cursor = "grabbing";
  }
  isHolding.canvas = true;
};

/**
 * @param {PointerEvent} e
 */
const pointerupHandler = () => {
  if (isAroundFocal(posX, posY) || isAroundInvertFocal(posX, posY) || isAroundObject(posX, posY)) {
    canvas.style.cursor = "grab";
  }
  isHolding.focal = false;
  isHolding.invertFocal = false;
  isHolding.object = false;
  isHolding.canvas = false;
};

/**
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 */
const isAroundFocal = (x, y) => {
  return x >= X_ORIGIN - f * SCALE - 25 && x <= X_ORIGIN - f * SCALE + 25 && y >= Y_ORIGIN - 25 && y <= Y_ORIGIN + 25;
};

/**
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 */
const isAroundInvertFocal = (x, y) => {
  return x >= X_ORIGIN - -f * SCALE - 25 && x <= X_ORIGIN - -f * SCALE + 25 && y >= Y_ORIGIN - 25 && y <= Y_ORIGIN + 25;
};

/**
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 */
const isAroundObject = (x, y) => {
  return (
    x >= X_ORIGIN - d_o * SCALE - 25 &&
    x <= X_ORIGIN - d_o * SCALE + 25 &&
    y >= Y_ORIGIN - h_o * SCALE - 25 &&
    y <= Y_ORIGIN - h_o * SCALE + 25
  );
};

const inputsOuterContainerEl = document.querySelector(".inputs-outer-container");
const grabEl = document.getElementById("grab");

grabEl.addEventListener("pointerdown", (e) => {
  isHolding.controls = true;
  grabEl.style.cursor = "grabbing";
});

document.body.addEventListener("pointermove", (e) => {
  if (isHolding.controls) {
    canvas.style.cursor = "grabbing";
    let posX = e.clientX - inputsOuterContainerEl.clientWidth / 2;

    if (posX >= 16 && posX + inputsOuterContainerEl.clientWidth <= window.innerWidth - 16) {
      inputsOuterContainerEl.style.left = posX + "px";
    }
  }
});

document.body.addEventListener("pointerup", () => {
  isHolding.controls = false;
  grabEl.style.cursor = "grab";
  canvas.style.cursor = "default";
});

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx
 * @param {number} cy
 * @param {number} r
 * @param {number} xMin
 * @param {number} yMin
 * @param {number} xMax
 * @param {number} yMax
 */
const midpoint = (ctx, cx, cy, r, xMin, yMin, xMax, yMax, { color= "black" } = { color: "black" }) => {
  let x = r;
  let y = 0;
  ctx.fillStyle = color;

  let P = 1 - r;
  while (x > y) {
    if (x + cx <= xMax && y + cy <= yMax && x + cx >= xMin && y + cy >= yMin) {
      ctx.fillRect(x + cx, y + cy, 1, 1);
    }
    if (-x + cx <= xMax && y + cy <= yMax && -x + cx >= xMin && y + cy >= yMin) {
      ctx.fillRect(-x + cx, y + cy, 1, 1);
    }
    if (x + cx <= xMax && -y + cy <= yMax && x + cx >= xMin && -y + cy >= yMin) {
      ctx.fillRect(x + cx, -y + cy, 1, 1);
    }
    if (-x + cx <= xMax && -y + cy <= yMax && -x + cx >= xMin && -y + cy >= yMin) {
      ctx.fillRect(-x + cx, -y + cy, 1, 1);
    }

    if (x !== y) {
      if (y + cx <= xMax && x + cy <= yMax && y + cx >= xMin && x + cy >= yMin) {
        ctx.fillRect(y + cx, x + cy, 1, 1);
      }
      if (-y + cx <= xMax && x + cy <= yMax && -y + cx >= xMin && x + cy >= yMin) {
        ctx.fillRect(-y + cx, x + cy, 1, 1);
      }
      if (y + cx <= xMax && -x + cy <= yMax && y + cx >= xMin && -x + cy >= yMin) {
        ctx.fillRect(y + cx, -x + cy, 1, 1);
      }
      if (-y + cx <= xMax && -x + cy <= yMax && -y + cx >= xMin && -x + cy >= yMin) {
        ctx.fillRect(-y + cx, -x + cy, 1, 1);
      }
    }

    y += 1;
    if (P <= 0) {
      P = P + 2 * y + 1;
    } else {
      x -= 1;
      P = P + 2 * y - 2 * x + 1;
    }
  }
};

/**
 * @param {CanvasRenderingContext2D} ctx 2d rendering context
 * @param {number} x1 Titik x awal
 * @param {number} y1 Titik y awal
 * @param {number} x2 Titik x akhir
 * @param {number} y2 Titik y akhir
 * @param {{color: string, style: "normal" | "dashed"}} [{color="black", style="normal"}={color:"black", style:"normal"}]
 */
const dda = (ctx, x1, y1, x2, y2, { color = "black", style = "normal" } = { color: "black", style: "normal" }) => {
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
      if (j % 12 === 0) {
        noPixel = !noPixel;
      }
      j++;
      if (noPixel) {
        continue;
      }
    }
    ctx.fillRect(x1, y1, 1, 1);
    j++;
  }
};

/**
 * @param {CanvasRenderingContext2D} ctx 2d rendering context
 * @param {number} x1 Titik x awal
 * @param {number} y1 Titik y awal
 * @param {number} x2 Titik x akhir
 * @param {number} y2 Titik y akhir
 * @param {{color: string, style: "normal" | "dashed", negative: false}} [{color="black", style="normal"}={color:"black", style:"normal", negative:false}]
 */
const ddaRay = (
  ctx,
  x1,
  y1,
  x2,
  y2,
  { color = "black", style = "normal", negative = false, top = false, right = false, bottom = false, left = false } = {
    color: "black",
    style: "normal",
    negative: false,
    top: false,
    right: false,
    bottom: false,
    left: false,
  }
) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const step = Math.max(Math.abs(dx), Math.abs(dy));

  const xIncrement = dx / step;
  const yIncrement = dy / step;

  ctx.fillStyle = color;

  let i = 0;
  let noPixel = false;
  while (true) {
    if (top) {
      if (y1 <= 0) break;
    }
    if (right) {
      if (x1 >= CANVAS_WIDTH) break;
    }
    if (bottom) {
      if (y1 >= CANVAS_HEIGHT) break;
    }
    if (left) {
      if (x1 <= 0) break;
    }

    x1 = negative ? x1 - xIncrement : x1 + xIncrement;
    y1 = negative ? y1 - yIncrement : y1 + yIncrement;
    if (style === "dashed") {
      if (i % 12 === 0) {
        noPixel = !noPixel;
      }
      i++;
      if (noPixel) {
        continue;
      }
    }
    ctx.fillRect(x1, y1, 1, 1);
    i++;
  }
};

/**
 * @param {CanvasRenderingContext2D} ctx 2d rendering context
 */
const drawBase = (ctx) => {
  // principal line
  dda(ctx, 0, Y_ORIGIN, CANVAS_WIDTH, Y_ORIGIN);

  dda(ctx, X_ORIGIN, 0, X_ORIGIN, CANVAS_HEIGHT);
};

/**
 * @param {CanvasRenderingContext2D} ctx 2d rendering context
 */
const drawObject = (ctx) => {
  const width = 0.3 * h_o * SCALE * 2;
  const armHeight = Y_ORIGIN - 0.8 * h_o * SCALE;
  const objX = X_ORIGIN - d_o * SCALE;
  const objY = Y_ORIGIN - h_o * SCALE;

  dda(ctx, objX, Y_ORIGIN, objX, objY, { color: "red" });
  dda(ctx, -width / 2 + objX, armHeight, width / 2 + objX, armHeight, { color: "red" });
  dda(ctx, -width / 2 + objX, armHeight, objX, objY, { color: "red" });
  dda(ctx, width / 2 + objX, armHeight, objX, objY, { color: "red" });
  dda(ctx, -width / 2 + objX, armHeight, objX, Y_ORIGIN, { color: "red" });
  dda(ctx, width / 2 + objX, armHeight, objX, Y_ORIGIN, { color: "red" });
};

/**
 * @param {CanvasRenderingContext2D} ctx 2d rendering context
 */
const drawSecondObject = (ctx) => {
  midpoint(
    ctx,
    X_ORIGIN-d_o*SCALE,
    Y_ORIGIN-(h_o-0.2*h_o)*SCALE,
    0.2*h_o*SCALE,
    X_ORIGIN-(d_o+0.2*h_o)*SCALE,
    Y_ORIGIN-h_o*SCALE,
    X_ORIGIN-(d_o-0.2*h_o)*SCALE,
    Y_ORIGIN-(h_o-(0.13*h_o*2))*SCALE,
    { color: "red" }
  )
  dda(
    ctx,
    X_ORIGIN-(d_o-0.2*h_o)*SCALE,
    Y_ORIGIN-(h_o-(0.13*h_o*2))*SCALE,
    X_ORIGIN-(d_o+0.2*h_o)*SCALE,
    Y_ORIGIN-(h_o-(0.13*h_o*2))*SCALE,
    { color: "red" }
  )
  dda(
    ctx,
    X_ORIGIN-(d_o+0.2*h_o)*SCALE,
    Y_ORIGIN-(h_o-(0.13*h_o*2))*SCALE,
    X_ORIGIN-(d_o+0.4*h_o)*SCALE,
    Y_ORIGIN,
    { color: "red" }
  )
  dda(
    ctx,
    X_ORIGIN-(d_o+0.08*h_o)*SCALE,
    Y_ORIGIN-(h_o-(0.13*h_o*2))*SCALE,
    X_ORIGIN-(d_o+0.2*h_o)*SCALE,
    Y_ORIGIN,
    { color: "red" }
  )
  dda(
    ctx,
    X_ORIGIN-d_o*SCALE,
    Y_ORIGIN-(h_o-(0.13*h_o*2))*SCALE,
    X_ORIGIN-d_o*SCALE,
    Y_ORIGIN,
    { color: "red" }
  )
  dda(
    ctx,
    X_ORIGIN-(d_o-0.08*h_o)*SCALE,
    Y_ORIGIN-(h_o-(0.13*h_o*2))*SCALE,
    X_ORIGIN-(d_o-0.2*h_o)*SCALE,
    Y_ORIGIN,
    { color: "red" }
  )
  dda(
    ctx,
    X_ORIGIN-(d_o-0.2*h_o)*SCALE,
    Y_ORIGIN-(h_o-(0.13*h_o*2))*SCALE,
    X_ORIGIN-(d_o-0.4*h_o)*SCALE,
    Y_ORIGIN,
    { color: "red" }
  )
}

/**
 * @param {CanvasRenderingContext2D} ctx 2d rendering context
 */
const drawImage = (ctx) => {
  const width = 0.3 * h_i * SCALE * 2;
  const armHeight = Y_ORIGIN - 0.8 * h_i * SCALE;
  const imgX = X_ORIGIN - d_i * SCALE;
  const imgY = Y_ORIGIN - h_i * SCALE;

  dda(ctx, imgX, Y_ORIGIN, imgX, imgY, { color: "blue" });
  dda(ctx, -width / 2 + imgX, armHeight, width / 2 + imgX, armHeight, { color: "blue" });
  dda(ctx, -width / 2 + imgX, armHeight, imgX, imgY, { color: "blue" });
  dda(ctx, width / 2 + imgX, armHeight, imgX, imgY, { color: "blue" });
  dda(ctx, -width / 2 + imgX, armHeight, imgX, Y_ORIGIN, { color: "blue" });
  dda(ctx, width / 2 + imgX, armHeight, imgX, Y_ORIGIN, { color: "blue" });
};

/**
 * @param {CanvasRenderingContext2D} ctx 2d rendering context
 */
const drawSecondImage = (ctx) => {
  let decision = d_i < 0;
  if (sim === 1) decision = !decision;
  if (d_o !== -f && d_o !== f && decision ) {
    midpoint(
      ctx,
      X_ORIGIN-d_i*SCALE,
      Y_ORIGIN-(h_i-0.2*h_i)*SCALE,
      Math.abs(0.2*h_i*SCALE),
      X_ORIGIN-(d_i-0.2*h_i)*SCALE,
      Y_ORIGIN-(h_i-(0.13*h_i*2))*SCALE,
      X_ORIGIN-(d_i+0.2*h_i)*SCALE,
      Y_ORIGIN-h_i*SCALE,
      { color: "blue" }
    )
  } else if (d_o !== -f && d_o !== f && !decision ) {
    midpoint(
      ctx,
      X_ORIGIN-d_i*SCALE,
      Y_ORIGIN-(h_i-0.2*h_i)*SCALE,
      Math.abs(0.2*h_i*SCALE),
      X_ORIGIN-(d_i+0.2*h_i)*SCALE,
      Y_ORIGIN-h_i*SCALE,
      X_ORIGIN-(d_i-0.2*h_i)*SCALE,
      Y_ORIGIN-(h_i-(0.13*h_i*2))*SCALE,
      { color: "blue" }
    )
  }
  dda(
    ctx,
    X_ORIGIN-(d_i-0.2*h_i)*SCALE,
    Y_ORIGIN-(h_i-(0.13*h_i*2))*SCALE,
    X_ORIGIN-(d_i+0.2*h_i)*SCALE,
    Y_ORIGIN-(h_i-(0.13*h_i*2))*SCALE,
    { color: "blue" }
  )
  dda(
    ctx,
    X_ORIGIN-(d_i+0.2*h_i)*SCALE,
    Y_ORIGIN-(h_i-(0.13*h_i*2))*SCALE,
    X_ORIGIN-(d_i+0.4*h_i)*SCALE,
    Y_ORIGIN,
    { color: "blue" }
  )
  dda(
    ctx,
    X_ORIGIN-(d_i+0.08*h_i)*SCALE,
    Y_ORIGIN-(h_i-(0.13*h_i*2))*SCALE,
    X_ORIGIN-(d_i+0.2*h_i)*SCALE,
    Y_ORIGIN,
    { color: "blue" }
  )
  dda(
    ctx,
    X_ORIGIN-d_i*SCALE,
    Y_ORIGIN-(h_i-(0.13*h_i*2))*SCALE,
    X_ORIGIN-d_i*SCALE,
    Y_ORIGIN,
    { color: "blue" }
  )
  dda(
    ctx,
    X_ORIGIN-(d_i-0.08*h_i)*SCALE,
    Y_ORIGIN-(h_i-(0.13*h_i*2))*SCALE,
    X_ORIGIN-(d_i-0.2*h_i)*SCALE,
    Y_ORIGIN,
    { color: "blue" }
  )
  dda(
    ctx,
    X_ORIGIN-(d_i-0.2*h_i)*SCALE,
    Y_ORIGIN-(h_i-(0.13*h_i*2))*SCALE,
    X_ORIGIN-(d_i-0.4*h_i)*SCALE,
    Y_ORIGIN,
    { color: "blue" }
  )
}

/**
 * @param {CanvasRenderingContext2D} ctx 2d rendering context
 */
const drawMirror = (ctx) => {
  ctx.fillStyle = "black";

  if (type === 1) {
    midpoint(
      ctx,
      X_ORIGIN - f * 2 * SCALE,
      Y_ORIGIN,
      f * 2 * SCALE,
      X_ORIGIN - 0.3 * f * SCALE,
      Y_ORIGIN - f * 2 * SCALE,
      X_ORIGIN,
      Y_ORIGIN + f * 2 * SCALE
    );
  } else {
    midpoint(
      ctx,
      X_ORIGIN - f * 2 * SCALE,
      Y_ORIGIN,
      -f * 2 * SCALE,
      X_ORIGIN,
      Y_ORIGIN + f * 2 * SCALE,
      X_ORIGIN - 0.3 * f * SCALE,
      Y_ORIGIN - f * 2 * SCALE
    );
  }
};

/**
 * @param {CanvasRenderingContext2D} ctx 2d rendering context
 */
const drawLens = (ctx) => {
  ctx.fillStyle = "black";

  if (type === 1) {
    midpoint(
      ctx,
      X_ORIGIN - f * 2 * SCALE + 1,
      Y_ORIGIN,
      f * 2 * SCALE,
      X_ORIGIN - 0.3 * f * SCALE,
      Y_ORIGIN - f * 2 * SCALE,
      X_ORIGIN,
      Y_ORIGIN + f * 2 * SCALE
    );
    midpoint(
      ctx,
      X_ORIGIN - -f * 2 * SCALE - 1,
      Y_ORIGIN,
      -(-f) * 2 * SCALE,
      X_ORIGIN,
      Y_ORIGIN + -f * 2 * SCALE,
      X_ORIGIN - 0.3 * -f * SCALE,
      Y_ORIGIN - -f * 2 * SCALE
    );
  } else {
    midpoint(
      ctx,
      X_ORIGIN - -f * 2 * SCALE + 0.3 * -f * SCALE - 1,
      Y_ORIGIN,
      -f * 2 * SCALE,
      X_ORIGIN,
      Y_ORIGIN - -f * 2 * SCALE,
      X_ORIGIN - 0.3 * f * SCALE,
      Y_ORIGIN + -f * 2 * SCALE
    );
    midpoint(
      ctx,
      X_ORIGIN - f * 2 * SCALE - 0.3 * -f * SCALE + 1,
      Y_ORIGIN,
      -f * 2 * SCALE,
      X_ORIGIN - 0.3 * -f * SCALE,
      Y_ORIGIN + f * 2 * SCALE,
      X_ORIGIN,
      Y_ORIGIN - f * 2 * SCALE
    );
  }
};

/**
 * @param {CanvasRenderingContext2D} ctx 2d rendering context
 */
const drawFocal = (ctx) => {
  ctx.fillStyle = "black";
  ctx.fillRect(X_ORIGIN - f * SCALE - 2, Y_ORIGIN - 2, 4, 4);

  if (sim === -1) {
    ctx.fillRect(X_ORIGIN + f * SCALE - 2, Y_ORIGIN - 2, 4, 4);
  }
};

/**
 * @param {CanvasRenderingContext2D} ctx 2d rendering context
 */
const drawCurvature = (ctx) => {
  ctx.fillStyle = "black";
  ctx.fillRect(X_ORIGIN - f * 2 * SCALE - 2, Y_ORIGIN - 2, 4, 4);

  if (sim === -1) {
    ctx.fillRect(X_ORIGIN + f * 2 * SCALE - 2, Y_ORIGIN - 2, 4, 4);
  }
};

window.addEventListener("resize", () => {
  CANVAS_WIDTH = window.innerWidth;
  CANVAS_HEIGHT = window.innerHeight;
  X_ORIGIN = CANVAS_WIDTH / 2;
  Y_ORIGIN = CANVAS_HEIGHT / 2;

  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  update();
});

/**
 * @param {CanvasRenderingContext2D} ctx 2d rendering context
 */
const drawMirrorRay = (ctx) => {
  const objX = X_ORIGIN - d_o * SCALE;
  const objY = Y_ORIGIN - h_o * SCALE;
  const imgX = X_ORIGIN - d_i * SCALE;
  const imgY = Y_ORIGIN - h_i * SCALE;
  const focalPos = X_ORIGIN - f * SCALE;

  // rule 1
  if (f > 0) {
    dda(ctx, 0, objY, X_ORIGIN, objY, { color: "green" });
    ddaRay(ctx, X_ORIGIN, objY, focalPos, Y_ORIGIN, { color: "green", bottom: true, left: true });
    if (d_i < 0) {
      ddaRay(ctx, X_ORIGIN, objY, imgX, imgY, { color: "green", style: "dashed", top: true, right: true });
    }
  } else if (f < 0) {
    dda(ctx, 0, objY, X_ORIGIN, objY, { color: "green" });
    ddaRay(ctx, X_ORIGIN, objY, focalPos, Y_ORIGIN, { color: "green", style: "dashed", right: true, bottom: true });
    ddaRay(ctx, X_ORIGIN, objY, focalPos, Y_ORIGIN, {
      color: "green",
      negative: true,
      top: true,
      left: true,
      bottom: true,
      right: true,
    });
  }

  // rule 3
  if (f > 0) {
    if (d_o !== f) {
      dda(ctx, 0, imgY, X_ORIGIN, imgY, { color: "purple" });
      if (d_i > 0) {
        ddaRay(ctx, X_ORIGIN, imgY, objX, objY, { color: "purple", top: true, left: true });
      } else if (d_i < 0) {
        ddaRay(ctx, X_ORIGIN, imgY, objX, objY, { color: "purple", bottom: true, left: true });
        dda(ctx, CANVAS_WIDTH, imgY, X_ORIGIN, imgY, { color: "purple", style: "dashed" });
      }
    }
  } else {
    if (d_o !== 0) {
      dda(ctx, 0, imgY, X_ORIGIN, imgY, { color: "purple" });
      dda(ctx, CANVAS_WIDTH, imgY, X_ORIGIN, imgY, { color: "purple", style: "dashed" });
      ddaRay(ctx, X_ORIGIN, imgY, objX, objY, { color: "purple", top: true, left: true });
    }
  }

  // rule 4
  if (d_o !== f && d_o !== 0 && f !== 0 && h_o !== 0) {
    ddaRay(ctx, X_ORIGIN, Y_ORIGIN, objX, objY, { color: "teal", top: true, left: true});
    if (f < 0) {
      ddaRay(ctx, X_ORIGIN, Y_ORIGIN, imgX, imgY, { color: "teal", style: "dashed", bottom: true, right: true});
      if (d_i < 0) {
        ddaRay(ctx, X_ORIGIN, Y_ORIGIN, imgX, imgY, { color: "teal", negative: true, bottom: true, right: true});
      }
    } else {
      if (d_i < 0) {
        ddaRay(ctx, X_ORIGIN, Y_ORIGIN, imgX, imgY, { color: "teal", negative: true, bottom: true, right: true});
        ddaRay(ctx, X_ORIGIN, Y_ORIGIN, imgX, imgY, { color: "teal", style: "dashed", top: true, right: true});
      } else {
        ddaRay(ctx, X_ORIGIN, Y_ORIGIN, imgX, imgY, { color: "teal", bottom: true, right: true});
      }
    }
  }
};

/**
 * @param {CanvasRenderingContext2D} ctx 2d rendering context
 */
const drawLensRay = (ctx) => {
  const objX = X_ORIGIN - d_o * SCALE;
  const objY = Y_ORIGIN - h_o * SCALE;
  const imgX = X_ORIGIN - d_i * SCALE;
  const imgY = Y_ORIGIN - h_i * SCALE;
  const focalPos = X_ORIGIN - f * SCALE;

  // rule 1
  if (f !== 0) {
    if (type === 1) {
      dda(ctx, 0, objY, X_ORIGIN, objY, { color: "green" });
      ddaRay(ctx, X_ORIGIN, objY, focalPos, Y_ORIGIN, { color: "green", style: "dashed", bottom: true, left: true });
      ddaRay(ctx, X_ORIGIN, objY, focalPos, Y_ORIGIN, { color: "green", negative: true, top: true, right: true });
    } else if (type === -1) {
      dda(ctx, 0, objY, X_ORIGIN, objY, { color: "green" });
      ddaRay(ctx, X_ORIGIN, objY, focalPos, Y_ORIGIN, { color: "green", bottom: true, right: true });
      if (d_i > 0 && d_o !== -f) {
        ddaRay(ctx, X_ORIGIN, objY, imgX, imgY, { color: "green", style: "dashed", top: true, left: true });
      }
    }
  }

  // rule 2
  if (d_o !== 0 && f !== 0) {
    ddaRay(ctx, X_ORIGIN, Y_ORIGIN, objX, objY, { color: "teal", negative: true, bottom: true, right: true });
    ddaRay(ctx, X_ORIGIN, Y_ORIGIN, objX, objY, { color: "teal", top: true, left: true });
  }

  // rule 3
  if (d_o !== 0 && d_o !== -f) {
    if (type === 1) {
      dda(ctx, CANVAS_WIDTH, imgY, X_ORIGIN, imgY, { color: "purple" });
      dda(ctx, 0, imgY, X_ORIGIN, imgY, { color: "purple", style: "dashed" });
      ddaRay(ctx, X_ORIGIN, imgY, objX, objY, { color: "purple", top: true, left: true });
    } else {
      if (d_i > 0) {
        dda(ctx, CANVAS_WIDTH, imgY, X_ORIGIN, imgY, { color: "purple" });
        dda(ctx, 0, imgY, X_ORIGIN, imgY, { color: "purple", style: "dashed" });
        ddaRay(ctx, X_ORIGIN, imgY, X_ORIGIN + f * SCALE, Y_ORIGIN, { color: "purple", bottom: true, left: true });
      } else {
        ddaRay(ctx, X_ORIGIN, imgY, objX, objY, { color: "purple", top: true, left: true });
        dda(ctx, CANVAS_WIDTH, imgY, X_ORIGIN, imgY, { color: "purple" });
      }
    }
  }
};

/**
 * @param {CanvasRenderingContext2D} ctx 2d rendering context
 */
const drawLabels = (ctx) => {
  const objX = X_ORIGIN - d_o * SCALE;
  const objY = Y_ORIGIN - h_o * SCALE;
  const imgX = X_ORIGIN - d_i * SCALE;
  const imgY = Y_ORIGIN - h_i * SCALE;
  const focalPos = X_ORIGIN - f * SCALE;
  const curvaturePos = X_ORIGIN - f * 2 * SCALE;

  const fontSize = 14;
  ctx.font = `${fontSize}px JetBrainsMono Nerd`;
  ctx.fillText("Objek", objX, objY);
  ctx.fillText(d_o, objX, Y_ORIGIN + fontSize);
  ctx.fillText(h_o, X_ORIGIN, objY);

  ctx.fillText("Bayangan", imgX, imgY);
  ctx.fillText(Math.round(d_i * 100) / 100, imgX, Y_ORIGIN + fontSize);
  ctx.fillText(Math.round(h_i * 100) / 100, X_ORIGIN, imgY);

  ctx.fillText("Fokus", focalPos, Y_ORIGIN);
  ctx.fillText(f, focalPos, Y_ORIGIN + fontSize);
  if (sim === -1) {
    ctx.fillText("Fokus", X_ORIGIN + f * SCALE, Y_ORIGIN);
    ctx.fillText(-f, X_ORIGIN + f * SCALE, Y_ORIGIN + fontSize);
  }

  ctx.fillText("Kurvatur", curvaturePos, Y_ORIGIN);
  if (sim === -1) {
    ctx.fillText("Kurvatur", X_ORIGIN + f * 2 * SCALE, Y_ORIGIN);
  }
};

let maxSliderX = CANVAS_WIDTH / 2 / SCALE;
let maxSliderY = CANVAS_HEIGHT / 2 / SCALE;
const update = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (maxSliderY < Y_ORIGIN / SCALE) {
    maxSliderY = Y_ORIGIN / SCALE;
  }
  objHeight.max = maxSliderY;

  if (maxSliderX < X_ORIGIN / SCALE) {
    maxSliderX = X_ORIGIN / SCALE;
  }
  objDistance.max = maxSliderX;
  focalLength.max = maxSliderX;

  canvas.style.setProperty("--x-origin", X_ORIGIN + "px");
  canvas.style.setProperty("--y-origin", Y_ORIGIN + "px");

  const menu = document.getElementById("checkbox-menu");
  const label = document.querySelector(".menu > label");
  const buttonsContainerEl = document.getElementsByClassName("buttons-container");
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

  d_i = 1 / (1 / f - 1 / (Number(selectedSim.value) * d_o));
  h_i = (-d_i / (Number(selectedSim.value) * d_o)) * h_o;

  drawBase(ctx);
  drawFocal(ctx);
  drawCurvature(ctx);
  drawLabels(ctx);

  const selectedObject = document.querySelector("input[name='object']:checked");
  if (selectedObject.value === "object1") {
    drawObject(ctx);
    drawImage(ctx);
  } else {
    drawSecondObject(ctx);
    drawSecondImage(ctx);
  }

  if (sim === 1) {
    drawMirror(ctx);
  } else {
    drawLens(ctx);
  }

  if (Number(selectedSim.value) === 1) {
    drawMirrorRay(ctx);
  } else {
    drawLensRay(ctx);
  }
};

update();
