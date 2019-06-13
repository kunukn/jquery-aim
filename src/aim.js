// https://stackoverflow.com/q/105034/815507
let uuidv4 = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    let r = (Math.random() * 16) | 0;
    return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
  });

function aim(options) {
  return init(options);
}

let items = [];
/**
 * pointerVelocity Velocity of the pointer pointer
 * pointerMagnitude Magnitude of velocity
 * pointerPosition Position of the pointer pointer
 * avgDeltaTime Average delta time for a simple calculation of new position, x = x0 +  v * t
 * pointerX the last retrived x coordinate of pointer cursor
 * pointerY the last retrived y coordinate of pointer cursor
 * anticipator an object to debug where pointer is aiming
 * anticipator.size, anticipator.radius, anticipator.center, anticipator.rect anticipator related properties
 * anRad Radius (or size) of the anticipator, increases as pointer move faster
 */

let clamp = (value, min, max) => Math.min(Math.max(value, min), max);

let getMagnitude = v => Math.sqrt(v.x * v.x + v.y * v.y);

let createVector = () => ({ x: 0, y: 0 });

let pointerVelocity = createVector(),
  pointerMagnitude = getMagnitude(pointerVelocity),
  pointerPosition = createVector(),
  avgDeltaTime = 12,
  pointerX = 0,
  pointerY = 0,
  DEBUG = false,
  anticipator = {
    size: 50,
    center: createVector(),
    effectiveSize: 1
  };
anticipator.rect = {
  x0: 0,
  y0: 0,
  x1: anticipator.size,
  y1: anticipator.size
};

/*
 * Default anticipate function
 *
 * @function anticipateFunc
 *
 * @param {type} position: position of anticipator
 * @param {type} velocity: velocity of anticipator
 * @param {type} pointerX pointer X coordinate
 * @param {type} pointerY pointer Y coordinate
 * @param {type} anticipator anticipator object
 * @returns {undefined}
 */

function anticipateFunc(position, velocity, pointerX, pointerY, anticipator) {
  let a = anticipator;

  // smoothen velocity values with ratio 0.7 / 0.3
  if (position.x && position.y) {
    velocity.x = velocity.x * 0.7 + (pointerX - position.x) * 0.3;
    velocity.y = velocity.y * 0.7 + (pointerY - position.y) * 0.3;
  }

  position.x = pointerX;
  position.y = pointerY;

  pointerMagnitude = getMagnitude(velocity);
  if (pointerMagnitude < 0.1) {
    velocity.x = 0;
    velocity.y = 0;
  }

  // change radius according to magnitude
  a.effectiveSize = Math.sqrt(a.size * pointerMagnitude + 1);

  /*
      assign anticipator coordinates according to new velocity values
      and smoothen it with ratio 0.7 / 0.3
    */
  a.center.x =
    a.center.x * 0.7 + (position.x + velocity.x * avgDeltaTime) * 0.3;

  let windowWidth = window.innerWidth;
  let windowHeight = window.innerHeigh;

  clamp(a.center.x, 0, windowWidth - a.effectiveSize);

  a.rect.x0 = a.center.x - a.effectiveSize;
  a.rect.x1 = a.center.x + a.effectiveSize;

  a.center.y =
    a.center.y * 0.7 + (position.y + velocity.y * avgDeltaTime) * 0.3;

  clamp(a.center.y, 0, windowHeight - a.effectiveSize);

  a.rect.y0 = a.center.y - a.effectiveSize;
  a.rect.y1 = a.center.y + a.effectiveSize;
}

function setDebug(isDebugEnabled) {
  let debugElement = document.querySelector("#aim-debug");

  if (isDebugEnabled) {
    if (debugElement) return;

    let debugObject = createDebugObject();
    anticipator.element = debugObject;
  } else {
    debugElement && debugElement.remove();
    anticipator.element = null;
  }
  DEBUG = isDebugEnabled;
}

aim.setDebug = setDebug;

function setAnticipateFunction(func) {
  if (typeof func === "function") {
    anticipateFunc = func;
  }
}

aim.setAnticipateFunction = setAnticipateFunction;

let getData = target => {
  let rect = null;
  if (target instanceof HTMLElement) {
    rect = target.getBoundingClientRect();
  }

  let { x, y, width, height } = rect || target;

  return {
    rect: {
      x0: x,
      y0: y,
      x1: x + width,
      y1: y + height
    },
    center: { x, y },
    increment: 0
  };
};

/*
 * Creates a circle object which is to be used to
 * show where the anticipator is at any time
 *
 * @returns {Object}
 */
function createDebugObject() {
  let size = anticipator.size;
  let element = document.createElement("div");
  element.setAttribute("id", "aim-debug");
  element.className = "aim-debug";
  element.style.width = 2 * size + "px";
  element.style.height = 2 * size + "px";
  element.style["margin-left"] = -size + "px";
  element.style["margin-top"] = -size + "px";

  document.body.appendChild(element);

  return element;
}

/*
 * Tests rectangle - rectangle intersection and gives the ratio of intersection. Max 1, min 0.
 *
 * @param {type} rect The first rectange
 * @param {type} rect2 The second rectange
 * @returns {Number} Ratio of intersection area to area of tailblazer
 */

function intersectRatio(rect, rect2) {
  let x_overlap = Math.max(
    0,
    Math.min(rect.x1, rect2.x1) - Math.max(rect.x0, rect2.x0)
  );
  let y_overlap = Math.max(
    0,
    Math.min(rect.y1, rect2.y1) - Math.max(rect.y0, rect2.y0)
  );

  return (
    (x_overlap * y_overlap) /
    (anticipator.effectiveSize * anticipator.effectiveSize)
  );
}

function init(options) {
  let { target } = options;
  delete options.target;

  let data = getData(target);
  data.options = options;
  let id = uuidv4();
  items.push({ id, target, data });

  return id;
}

let tick = () => {
  let a = anticipator;

  if (!items.length) return;

  anticipateFunc(pointerPosition, pointerVelocity, pointerX, pointerY, a);

  if (DEBUG) {
    a.element.style.transform = `translate(${a.center.x}px, ${
      a.center.y
    }px) scale(${a.effectiveSize / a.size})`;
  }

  /*
   * Iterate over each elements and calculate increment for all
   * In each cycle, it increases by a value between 0 - 0.2 (reaches max if it fully intersects) and decreases by 0.05
   * Increment can be between 0 and 2
   * If it's greater than 1, aimEnter function will be called
   * if it's less than or equal to 0, aimExit function will be called
   */

  items.forEach(item => {
    let target = item.target;
    let data = item.data;

    let intersectRatioValue = intersectRatio(data.rect, a.rect);

    // check if they intersects and pointer is not on the element
    if (intersectRatioValue && pointerMagnitude !== 0) {
      data.increment = data.increment + intersectRatioValue * 0.2;
      if (data.increment > 1 && data.increment < 2) {
        if (data.options.className && target instanceof HTMLElement)
          target.classList.add(data.options.className);
        if (typeof data.options.aimEnter === "function")
          data.options.aimEnter.call(target, item);

        if (data.increment > 2) data.increment = 2;

        if (DEBUG) a.element.style["background-color"] = "tomato";
      } else if (data.increment > 2) {
        data.increment = 2;
        if (DEBUG) a.element.style["background-color"] = "tomato";
      }
      return;
    } else {
      if (DEBUG) a.element.style["background-color"] = "yellowgreen";
    }

    if (data.increment !== 0) {
      data.increment = data.increment - 0.05;
      if (data.increment < 0) {
        data.increment = 0;
        if (data.options.className && target instanceof HTMLElement)
          target.classList.remove(data.options.className);
        if (typeof data.options.aimExit === "function")
          data.options.aimExit.call(target, item);
      }
    }
  });
};

let isRunning = true;
let run = () => {
  let token;
  tick();
  if (isRunning) {
    token = requestAnimationFrame(run);
  } else {
    cancelAnimationFrame(token);
  }
};

let onPointerMove = e => {
  pointerX = e.clientX;
  pointerY = e.clientY;
};

let aimHasStarted = false;

aim.start = () => {
  if (aimHasStarted) return;

  aimHasStarted = true;
  document.addEventListener("pointermove", onPointerMove);
  isRunning = true;
  run();
};
aim.stop = () => {
  if (!aimHasStarted) return;

  aimHasStarted = false;

  isRunning = false;
  document.removeEventListener("pointermove", onPointerMove);
};

aim.remove = target => {
  let wasRemoved = false;
  if (target instanceof HTMLElement) {
    items.forEach(item => {
      if (item.target === target) {
        item = null;
        wasRemoved = true;
        return;
      }
    });
  } else {
    items.forEach(item => {
      if (item.id === target.id) {
        item = null;
        wasRemoved = true;
        return;
      }
    });
  }
  if (wasRemoved) items = items.filter(Boolean);

  return wasRemoved;
};

aim.updatePosition = target => {
  let wasUpdated = false;
  if (target instanceof HTMLElement) {
    items.forEach(item => {
      if (item.target === target) {
        let data = getData(target);
        item.data.rect = data.rect;
        item.data.center = data.center;
        item.data.increment = data.increment;
        wasUpdated = true;
        return;
      }
    });
  } else {
    items.forEach(item => {
      if (item.id === target.id) {
        let data = getData(target);
        item.data.rect = data.rect;
        item.data.center = data.center;
        item.data.increment = data.increment;
        wasUpdated = true;
        return;
      }
    });
  }
  return wasUpdated;
};

export default aim;