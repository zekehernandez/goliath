import k from "../kaboom";
import { UNITS } from '../constants';
import { START_JUMP_END_FRAME, LANDING_END_FRAME } from '../main';
import levels from '../levels';

// general game consts
const GRAVITY = 0.2;
const SLOW_MO_MODIFIER = 0.045;

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
const BLADE_SPEED = 1000;
const BLADE_START_DISTANCE = 50;

const playerProps = [
  "player",
    sprite("player"),
    scale(2, 2),
    z(1),
    area(),
    origin("center"),
    {
      sideSpeed: 0,
      upSpeed: 0,
    },
];

const launchArrowProps = [
  "launchArrow",
  sprite("arrow"),
  scale(0.5, 0.5),
  rotate(0),
  origin("center"),
  area(),
];

const throwArrowProps = [
  "throwArrow",
  sprite("arrow"),
  scale(0.5, 0.5),
  rotate(0),
  pos(-2*UNITS, -2*UNITS),
  origin("center"),
  area(),
  opacity(0),
];

k.scene("game", (args = {}) => {
  // game state
  let currentLevel;
  let launchState;
  let slowMo;
  let gravity;
  let previousMouseDown;
  let levelWin;

  let player;
  let launchArrow;
  let throwArrow;
  let overlay;

  let startingPosition;

  const speedModifier = () => slowMo ? SLOW_MO_MODIFIER : 1;

  const startLevel = (newLevel) => {
    // destroy any existing game objects
    k.every((obj) => obj.destroy());

    currentLevel = newLevel;
    levelWin = false;
    launchState = "prelaunch";
    slowMo = false;
    gravity = 0;
    previousMouseDown = mouseIsDown();

    add([
      "sky",
      rect(width(), height()),
      color(220, 240, 255),
    ]);

    overlay = add([
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

    addLevel(levels[currentLevel], {
      // define the size of each block
      width: 48,
      height: 48,
      // define what each symbol means, by a function returning a comp list (what you'll pass to add())
      "@": () => [...playerProps],
      "+": () => [
        "launch",
        rect(1*UNITS, 1*UNITS),
        area(),
        solid(),
        outline(),
        color(127, 200, 255),
      ],
      "=": () => [
        "land",
        rect(1*UNITS, 1*UNITS),
        area(),
        solid(),
        outline(),
        color(127, 255, 255),
      ],
      "x": () => [
        "enemy",
        rect(1*UNITS, 2*UNITS),
        area(),
        body(),
        color(60, 230, 110),
        origin("left"),
        outline(),
        {
          disabled: false,
        },
      ],
    });

    player = get("player")[0];
    player.play("landing");
    startingPosition = {...player.pos};

    // launch arrow
    launchArrow = add([...launchArrowProps, pos(player.pos)]);

    // throw arrow
    throwArrow = add([...throwArrowProps]);
  }

  startLevel(0);

  /**
   * Event Handling
   */

  const reset = () => {
    player.destroy();
    throwArrow.destroy();
    launchState = "prelaunch";
    slowMo = false;
    gravity = 0;
    player = add([...playerProps, pos(startingPosition)]);
    player.play("landing");
    launchArrow = add([...launchArrowProps, pos(startingPosition)]);
    throwArrow = add([...throwArrowProps]);
  }

  // throwing
  const startThrow = () => {
    slowMo = true;
    throwArrow.opacity = 1;
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
    } else if (levelWin) {
      if (currentLevel + 1 === levels.length) {
        go("win");
      } else {
        startLevel(currentLevel + 1);
      }
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

  keyPress("tab", () => startLevel(currentLevel))

  // landing
  collides("player", "land", (player, land) => {
    launchState = "landed";
    player.sideSpeed = 0;
    player.upSpeed = 0;
    gravity = 0;
    slowMo = false;
    throwArrow.destroy();
    checkEnd();
  });

  const winLevel = () => {
    wait(1, () => {
      destroyAll("blade");
      every("enemy", enemy => {
        addKaboom(enemy.pos);
        enemy.destroy();
      });
      shake(20); // why not?
    });
 
    wait(2, () => {
      levelWin = true;

      add([
        rect(10*UNITS, 6*UNITS),
        area(),
        color(40, 40, 60),
        pos(center()),
        origin("center"),
      ]);

      add([
        "title",
        text("Great!", { size: 40 }),
        origin("center"),
        pos(center().x, center().y - 20),
      ]);

      add([
        "continue",
        text("Click to continue", { size: 20 }),
        origin("center"),
        pos(center().x, center().y + 20),
      ]);
    })
  }

  const incompleteLevel = () => {
    wait(1, () => {
      every("enemy", enemy => {
        if (!enemy.disabled) {
          enemy.color = rgb(240, 50, 50);
        }
      });

      reset();
    });
  };

  const checkEnd = () => {
    let isEnded = launchState === "landed";
    every("blade", blade => {
      if (blade.speed > 0) {
        isEnded = false;
      }
    })

    if (isEnded) {
      let isVictory = true;
      every("enemy", enemy => {
        if (!enemy.disabled) {
          isVictory = false;
        }
      });

      if (isVictory) {
        winLevel();
      } else {
        incompleteLevel();
      }
    }
  }

  collides("blade", "enemy", (blade, enemy) => {
    blade.speed = 0;
    enemy.disabled = true;
    enemy.color = rgb(180, 180, 160);
    shake(10);
    checkEnd();
  });

  collides("blade", "land", (blade) => {
    blade.speed = 0;
    checkEnd();
  });

  action("blade", (blade) => {
    blade.move(dir(blade.throwAngle).scale(blade.speed * speedModifier()));

    if (blade.pos.y >= height() || blade.pos.x >= width() 
    || blade.pos.y < 0 || blade.pos.x < 0) {
      destroy(blade);
      checkEnd();
    }
  });

  // launch arrow movement
  let direction = 1;
  action("launchArrow", launchArrow => {
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
  action("throwArrow", throwArrow => {
    if (slowMo) {
      throwArrow.angle += THROW_ARROW_SPEED;
      if (throwArrow.angle === 360) {
        slowMo = false;
        launchState = "afterThrow";
        throwArrow.destroy();
      }
    }

    throwArrow.pos = player.pos.add(0*UNITS, 0*UNITS);
  });

    // player movement
  action("player", player => {
    player.moveBy(player.sideSpeed * speedModifier(), -player.upSpeed * speedModifier());
    if (!slowMo) {
      player.upSpeed -= gravity;  
    }

    if (player.pos.x > width() + 2*UNITS || player.pos.y > height() + 2*UNITS) {
      reset();
    }

    // I have to manage the animation transitions like this because onEnd()
    const curAnim = player.curAnim();
    if (launchState === "prelaunch" && curAnim !== "idle") {
      player.play("idle", { loop: true, speed: 4 });
    } else if (launchState === "launching" && curAnim !== "crouch") {
      player.play("crouch", { loop: true, speed: 4 });
    } else if (launchState === "launched" || launchState === "afterThrow") {
      if (slowMo) {
        if (curAnim === "somersault") {
          player.play("throwing");
        }


        player.angle = throwArrow.angle;
      } else {
        if (curAnim === "crouch") {
          player.play("startJump", { speed: 10 });
        } else if (curAnim !== "somersault" && (curAnim !== "startJump" || player.frame >= START_JUMP_END_FRAME)) {
          player.play("somersault", { loop: true });
          player.flipX(false);
          player.angle = 0;
        } 
      }
    } else if (launchState === "landed" && player.frame !== LANDING_END_FRAME) {
      if (!curAnim || curAnim === "somersault" || curAnim === "throwing") {
        player.play("landing", { speed: 2 });
        player.flipX(false);
        player.angle = 0;
      }
    } else if (curAnim !== "idle" && (get("enemy").length === 0 || levelWin === true)) {
      player.play("idle", { loop: true, speed: 4});
    }
  });
});
