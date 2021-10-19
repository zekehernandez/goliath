import kaboom from "kaboom";

// general game consts
const UNITS = 48;
const GRAVITY = 0.2;

// launch arrow consts
const LAUNCH_ARROW_SPEED = 0.75;
const LAUNCH_ARROW_MIN_ANGLE = 0;
const LAUNCH_ARROW_MAX_ANGLE = 90;
const LAUNCH_ARROW_MAX_STRENGTH = 2;

// throw arrow consts
const THROW_ARROW_SPEED = 2.5;

// game state
let launchState = "prelaunch";
let frozen = false;
let gravity = 0;

// initialize context
kaboom({ width: 36*UNITS, height: 20*UNITS });

// load assets
loadSprite("bean", "sprites/bean.png");
loadSprite("arrow", "sprites/arrow.png");

/**
 * Add Entities
 */

// player character
const player = add([
  "player",
  sprite("bean"),
  pos(2*UNITS, height() - 5*UNITS),
  area(),
  {
    sideSpeed: 0,
    upSpeed: 0,
  }
]);

// launch arrow
const launchArrow = add([
  "launchArrow",
  sprite("arrow"),
  scale(0.5, 0.5),
  rotate(0),
  pos(2.5*UNITS, height() - 4*UNITS),
  origin("center"),
  area(),
]);

// starting rooftop
add([
  "launch",
  rect(4*UNITS, 4*UNITS),
  pos(0, height() - 4*UNITS),
  area(),
  solid(),
  color(127, 200, 255),
]);

// landing rooftop 
add([
  "land",
  rect(24*UNITS, 3*UNITS),
  pos(8*UNITS, height() - 3*UNITS),
  area(),
  solid(),
  color(127, 255, 255),
]);

// throw arrow
const throwArrow = add([
  "throwArrow",
  sprite("arrow"),
  scale(0.5, 0.5),
  rotate(0),
  pos(-2*UNITS, -2*UNITS),
  origin("center"),
  area(),
]);

/**
 * Event Handling
 */

// begin launch
mouseDown(() => {
  if (launchState === "prelaunch") {
      launchState = "launching";
  }
});

// launch
mouseRelease(() => {
  if (launchState === "launching") {
    launchState = "launched"
    const start = vec2(0,0);
    const end = start.add((dir(LAUNCH_ARROW_MAX_ANGLE - launchArrow.angle).scale(launchArrow.scale.scale(10))));

    player.sideSpeed = end.x;
    player.upSpeed = end.y;
    gravity = GRAVITY;
  }
});

// throwing
const startThrow = () => {
  frozen = true;
  throwArrow.pos = player.pos.add(0.5*UNITS, 0.5*UNITS);
};
mouseClick(() => {
  if (launchState === "launched") {
    startThrow();
  }
})

// landing
collides("player", "land", () => {
  launchState = "landed";
  player.sideSpeed = 0;
  player.upSpeed = 0;
  gravity = 0;
  shake(); // why not?
})

/** 
 * Game Loops
 */

// player movement
player.action(() => {
  if (!frozen) {
    player.moveBy(player.sideSpeed, -player.upSpeed);
    player.upSpeed -= gravity;  
  }
});

// launch arrow movement
let direction = 1;
launchArrow.action(() => {
  if (launchState === "prelaunch") {
    if (launchArrow.angle <= LAUNCH_ARROW_MIN_ANGLE) {
      direction = 1;
    } else if (launchArrow.angle >= LAUNCH_ARROW_MAX_ANGLE) {
      direction = -1;
    }
    launchArrow.angle = launchArrow.angle + (direction * LAUNCH_ARROW_SPEED);
  } else if (launchState === "launching") {
    if (launchArrow.scale.x <= LAUNCH_ARROW_MAX_STRENGTH) {
          launchArrow.scale = launchArrow.scale.add(0.01, 0.01);
    }
  } else if (launchState === "launched") {
    launchArrow.destroy();
  }
})

// throw arrow movement
throwArrow.action(() => {
  if (frozen) {
    throwArrow.angle += THROW_ARROW_SPEED;
    if (throwArrow.angle === 360) {
      frozen = false;
      throwArrow.destroy();
    }
  }
});
