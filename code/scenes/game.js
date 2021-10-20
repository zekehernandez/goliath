import k from "../kaboom";
import { UNITS } from '../constants';

// general game consts
const GRAVITY = 0.2;
const SLOW_MO_MODIFIER = 0.075;

// launch arrow consts
const LAUNCH_ARROW_SPEED = 0.75;
const LAUNCH_ARROW_MIN_ANGLE = 0;
const LAUNCH_ARROW_MAX_ANGLE = 90;
const LAUNCH_ARROW_STRENGHT_SPEED = 0.01;
const LAUNCH_ARROW_MAX_STRENGTH = 2;
const LAUNCH_ARROW_STRENGTH_MODIFIER = 10;

// throw arrow consts
const THROW_ARROW_SPEED = 2;

// blade
const BLADE_SPEED = 500;
const BLADE_START_DISTANCE = 50;

k.scene("game", (args = {}) => {
  // game state
  let launchState = "prelaunch";
  let slowMo = false;
  let gravity = 0;

  let previousMouseDown = mouseIsDown();

  const speedModifier = () => slowMo ? SLOW_MO_MODIFIER : 1;

  /**
   * Add Entities
   */
  

  add([
    "sky",
		rect(width(), height()),
		color(220, 240, 255),
	]);

  const overlay = add([
		rect(width(), height()),
		color(0, 0, 0),
		opacity(0),
	]);

	overlay.action(() => {
		if (slowMo) {
			overlay.opacity = wave(0, 0.25, 1000);
		} else {
			overlay.color = rgb(0, 0, 0);
			overlay.opacity = 0;
		}
	});

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
    outline(),
    color(127, 200, 255),
  ]);

  // landing rooftop 
  add([
    "land",
    rect(24*UNITS, 3*UNITS),
    pos(8*UNITS, height() - 3*UNITS),
    area(),
    solid(),
    outline(),
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
    opacity(0),
  ]);

  add([
    "enemy",
    rect(1*UNITS, 2*UNITS),
    pos(10*UNITS, height() - 5*UNITS),
    area(),
    body(),
    color(60, 230, 110),
    outline(),
  ]);

  add([
    "enemy",
    rect(1*UNITS, 2*UNITS),
    pos(18*UNITS, height() - 5*UNITS),
    area(),
    body(),
    color(60, 230, 110),
    outline(),
  ]);

  add([
    "enemy",
    rect(1*UNITS, 2*UNITS),
    pos(24*UNITS, height() - 5*UNITS),
    area(),
    body(),
    color(60, 230, 110),
    outline(),
  ]);

  /**
   * Event Handling
   */


  // throwing
  const startThrow = () => {
    slowMo = true;
    throwArrow.opacity = 1;
    throwArrow.pos = player.pos.add(0.5*UNITS, 0.5*UNITS);
  };
  const throwBlade = () => {
    const bladePos = throwArrow.pos.add(dir(throwArrow.angle - 90).scale(BLADE_START_DISTANCE));
    add([
      "blade",
      rect(10, 10),
      area(),
      pos(bladePos),
      {
        speed: BLADE_SPEED,
        throwAngle: throwArrow.angle - 90,
      }
    ]);
  };

  const gameAction = () => {
    if (launchState === "launched" && !slowMo) {
      startThrow();
    } else if (slowMo) {
      throwBlade();
    }
  }

  const actionDown = () => {
  if (launchState === "prelaunch") {
      launchState = "launching";
    }
  }

  const actionUp = () => {
    if (launchState === "launching") {
      launchState = "launched"
      const start = vec2(0,0);
      const end = start.add((dir(LAUNCH_ARROW_MAX_ANGLE - launchArrow.angle).scale(launchArrow.scale.scale(LAUNCH_ARROW_STRENGTH_MODIFIER))));

      player.sideSpeed = end.x;
      player.upSpeed = end.y;
      gravity = GRAVITY;
    }
  }

  const doMouseDown = () => {
    if (!previousMouseDown) {
      actionDown();
    }
  };

  const doMouseUp = () => {
    if (previousMouseDown) {
      previousMouseDown = false;
    } else {
      actionUp();
    }
  };

  mouseDown(doMouseDown);
  mouseRelease(doMouseUp);
  mouseClick(gameAction)

  keyDown("space", actionDown);
  keyRelease("space", actionUp);
  keyPress("space", gameAction);

  keyPress("tab", () => k.go("game"))

  // landing
  collides("player", "land", () => {
    launchState = "landed";
    player.sideSpeed = 0;
    player.upSpeed = 0;
    gravity = 0;
    shake(20); // why not?
  });

  collides("blade", "enemy", (blade) => {
    blade.speed = 0;
    shake(10);
  });

  collides("blade", "land", (blade) => {
    blade.speed = 0;
  });

  action("blade", (blade) => {
    blade.move(dir(blade.throwAngle).scale(blade.speed * speedModifier()));
  });

  /** 
   * Game Loops
   */

  // player movement
  player.action(() => {
    player.moveBy(player.sideSpeed * speedModifier(), -player.upSpeed * speedModifier());
    if (!slowMo) {
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
            launchArrow.scale = launchArrow.scale.add(LAUNCH_ARROW_STRENGHT_SPEED, LAUNCH_ARROW_STRENGHT_SPEED);
      }
    } else if (launchState === "launched") {
      launchArrow.destroy();
    }
  })

  // throw arrow movement
  throwArrow.action(() => {
    if (slowMo) {
      throwArrow.angle += THROW_ARROW_SPEED;
      if (throwArrow.angle === 360) {
        slowMo = false;
        throwArrow.destroy();
      }
    }

    throwArrow.pos = player.pos.add(0.5*UNITS, 0.5*UNITS);
  });
});
