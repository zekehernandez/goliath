import k from "../kaboom";
import { UNITS } from '../constants';
import { START_JUMP_END_FRAME, LANDING_END_FRAME } from '../main';
import levels from '../levels';

const COLORS = {
  BLACK: rgb(0, 0, 0),
  GREY: rgb(180, 180, 160),
  RED: rgb(240, 50, 50),
  GREEN: rgb(60, 230, 110),
}

// general game consts
const GRAVITY = 0.2;
const SLOW_MO_MODIFIER = 0.045;
const STARTING_AMMO_COUNT = 3;
const STARTING_SMOKE_BOMB_COUNT = 3;

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

const moverProps = {
  sideSpeed: 0,
  upSpeed: 0,
};

const kickableProps = {
  kickDirection: 0,
};

const playerComps = [
  "player",
    sprite("player"),
    scale(2, 2),
    z(1),
    area(),
    origin("center"),
    {
      ...moverProps,
    },
];

const launchArrowComps = [
  "launchArrow",
  sprite("arrow"),
  scale(0.5, 0.5),
  rotate(0),
  origin("center"),
  area(),
];

const throwArrowComps = [
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
  let ammoCount = STARTING_AMMO_COUNT;
  let smokeBombCount = STARTING_SMOKE_BOMB_COUNT;

  // level state
  let launchState;
  let slowMo;
  let previousMouseDown;
  let levelWin;
  let isKicking;

  let player;
  let launchArrow;
  let throwArrow;
  let overlay;
  let ammoCounter;
  let smokeBombCounter;
  let ammoRecovered = 0;
  let misses;

  let startingPosition;

  const speedModifier = () => slowMo ? SLOW_MO_MODIFIER : 1;
  const getAmmoCounterText = () => `Ammo: ${ammoCount}`;
  const getSmokeBombCounterText = () => `Smoke Bombs: ${smokeBombCount}`;

  layers([
    "bg",
    "game",
    "ui",
], "game");

  const startLevel = (newLevel) => {
    // destroy any existing game objects
    k.every((obj) => obj.destroy());

    ammoCount += ammoRecovered;

    ammoCounter = add([
      "ammoCounter",
      text(getAmmoCounterText(), { font: 'sink', size: 24 }),
      pos(1*UNITS, 1*UNITS),
      layer('ui'),
      color(ammoCount > 0 ? COLORS.BLACK : COLORS.RED),
    ]);

    smokeBombCounter = add([
      "smokeBombsCounter",
      text(getSmokeBombCounterText(), { font: 'sink', size: 24 }),
      pos(1*UNITS, 2*UNITS),
      layer('ui'),
      color(smokeBombCount > 0 ? COLORS.BLACK : COLORS.RED),
    ]);

    currentLevel = newLevel;
    levelWin = false;
    launchState = "prelaunch";
    slowMo = false;
    isKicking = false;
    previousMouseDown = mouseIsDown();
    ammoRecovered = 0;
    misses = 0;

    add([
      "sky",
      rect(width(), height()),
      color(220, 240, 255),
      layer("bg"),
    ]);

    overlay = add([
      rect(width(), height()),
      color(0, 0, 0),
      opacity(0),
    layer("bg"),
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
      "@": () => [...playerComps],
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
        "kickable",
        rect(1*UNITS, 2*UNITS),
        area(),
        body(),
        color(COLORS.GREEN),
        origin("left"),
        outline(),
        {
          disabled: false,
          ...kickableProps,
        },
      ],
      "o": () => [
        "enemy",
        "flier",
        rect(1*UNITS, 1*UNITS),
        area(),
        solid(),
        color(COLORS.GREEN),
        origin("left"),
        outline(),
        {
          disabled: false,
          ...moverProps,
        },
      ],
    });

    player = get("player")[0];
    player.play("landing");
    startingPosition = {...player.pos};

    // launch arrow
    launchArrow = add([...launchArrowComps, pos(player.pos)]);

    // throw arrow
    throwArrow = add([...throwArrowComps, follow(player)]);
  }

  startLevel(0);

  /**
   * Event Handling
   */

  const reset = () => {
    useSmokeBomb();
    player.destroy();
    throwArrow.destroy();
    launchArrow.destroy();
    launchState = "prelaunch";
    slowMo = false;
    player = add([...playerComps, pos(startingPosition)]);
    player.play("landing");
    launchArrow = add([...launchArrowComps, pos(startingPosition)]);
    throwArrow = add([...throwArrowComps, follow(player)]);
  }

  const attemptReset = () => {
    if (smokeBombCount > 0) {
      reset();
    } else {
      go("gameOver");
    }
  }

  const flashAmmo = () => {
    shake(1);
  }

  const useAmmo = () => {
    ammoCount -= 1;
    ammoCounter.text = getAmmoCounterText();
    if (ammoCount === 0) {
      ammoCounter.color = COLORS.RED;
    }
  }

  const useSmokeBomb = () => {
    smokeBombCount -= 1;
    smokeBombCounter.text = getSmokeBombCounterText();
    if (smokeBombCount === 0) {
      smokeBombCounter.color = COLORS.RED;
    }
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
        ...moverProps,
      }
    ]);
    useAmmo();
  };

  const gameAction = () => {
    if (launchState === "launched" && !slowMo) {
      ammoCount > 0 ? startThrow() : flashAmmo();
    } else if (slowMo) {
      ammoCount > 0 ? throwBlade() : flashAmmo();
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

      player.use("mover");
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
      const stats = add([
        rect(10*UNITS, 6*UNITS),
        area(),
        color(40, 40, 60),
        pos(center().x, 2*UNITS),
        origin("top"),
        layer('ui'),
      ]);

      add([
        "title",
        text("Great!", { size: 40 }),
        origin("center"),
        pos(stats.pos.x, stats.pos.y + 1*UNITS),
        layer('ui'),
      ]);

      wait(1, () => {
        add([
          "misses",
          text(`Misses: ${misses}`, { size: 14 }),
          origin("center"),
          pos(stats.pos.x, stats.pos.y + 2*UNITS),
          layer('ui'),
        ]);
        shake(10);

        wait(1, () => {
          add([
            "ammorecovered",
            text(`Ammo Recovered: ${ammoRecovered}`, { size: 14 }),
            origin("center"),
            pos(stats.pos.x, stats.pos.y + 3*UNITS),
            layer('ui'),
          ]);
          shake(10);

          wait(1, () => {
            add([
              "continue",
              text("Click to continue", { size: 20 }),
              origin("center"),
              pos(stats.pos.x, stats.pos.y + 5*UNITS),
              layer('ui'),
            ]);
            shake(20);

            levelWin = true;
          });
        }); 
      });
    });
  }

  const incompleteLevel = () => {
    wait(1, () => {
      every("enemy", enemy => {
        if (!enemy.disabled) {
          enemy.color = COLORS.RED;
        }
      });
    });

    wait(2, () => {
      attemptReset();
    })
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

      console.log('hello what is happening');
      if (isVictory) {
        winLevel();
      } else {
        incompleteLevel();
      }
    }
  }

  collides("mover", "land", (mover) => {
      mover.unuse("mover");
      mover.sideSpeed = 0;
      mover.upSpeed = 0;
      shake(10);
  });

  // landing
  collides("player", "land", (player, land) => {
    if (launchState !== "landed") {
      launchState = "landed";
      slowMo = false;
      throwArrow.destroy();
      checkEnd();
    }
  });

  collides("blade", "enemy", (blade, enemy) => {
    const wasPreviouslyDisabled = enemy.disabled;
    blade.speed = 0;
    enemy.disabled = true;
    enemy.color = COLORS.GREY;
    ammoRecovered++;
    shake(5);
    !wasPreviouslyDisabled && checkEnd();
  });

  collides("blade", "flier", (blade, flier) => {
    flier.use("mover");
    blade.use(follow(flier, blade.pos.sub(flier.pos)));

    const direction = dir(blade.throwAngle).scale(4)
    console.log({ angle: blade.throwAngle, direction });
    flier.sideSpeed = direction.x;
    flier.upSpeed = -direction.y;
  });

  collides("blade", "land", (blade) => {
    blade.speed = 0;
    ammoRecovered++;
    misses++;
    checkEnd();
  });

  collides("player", "flier", (player, flier) => {
    if (!flier.disabled) {
      shake(10);
      player.sideSpeed = 0;
    }
  });

  collides("player", "kickable", (player, kickable) => {
    if (kickable.disabled === false) {
      isKicking = true;
      slowMo = true;
      kickable.disabled = true;
      kickable.color = COLORS.GREY;
      shake(10);
      wait(1, () => {
        kickable.kickDirection = player.pos.sub(kickable.pos).x;
        slowMo = false;
        isKicking = false;
      })
    }
  });

  action("blade", (blade) => {
    blade.move(dir(blade.throwAngle).scale(blade.speed * speedModifier()));

    if (blade.pos.y >= height() || blade.pos.x >= width() 
    || blade.pos.y < 0 || blade.pos.x < 0) {
      misses++;
      destroy(blade);
      checkEnd();
    }
  });

  action("kickable", kickable => {
    if (kickable.kickDirection !== 0) {
      kickable.moveBy(kickable.kickDirection < 0 ? 40 : -40, 0);
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
  });

  action("mover", mover => {
    mover.moveBy(mover.sideSpeed * speedModifier(), -mover.upSpeed * speedModifier());

    if (!slowMo) {
      mover.upSpeed -= gravity;  
    }
  });

    // player movement
  action("player", player => {
    if (player.pos.x > width() + 2*UNITS || player.pos.y > height() + 2*UNITS) {
      attemptReset();
    }

    // I have to manage the animation transitions like this because onEnd()
    const curAnim = player.curAnim();
    if (isKicking) {
      player.play("kicking", { loop: true })
    } else if (launchState === "prelaunch" && curAnim !== "idle") {
      player.play("idle", { loop: true, speed: 4 });
    } else if (launchState === "launching" && curAnim !== "crouch") {
      player.play("crouch", { loop: true, speed: 4 });
    } else if (launchState === "launched" || launchState === "afterThrow") {
      if (slowMo) {
        if (curAnim === "somersault") {
          player.play("throwing", { loop: true });
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
      if (!curAnim || curAnim === "somersault" || curAnim === "throwing" || curAnim === "kicking") {
        player.play("landing", { speed: 2 });
        player.flipX(false);
        player.angle = 0;
      }
    } else if (curAnim !== "idle" && (get("enemy").length === 0 || levelWin === true)) {
      player.play("idle", { loop: true, speed: 4});
    }
  });
});
