import k from "../kaboom";
import { UNITS } from '../constants';
import { COLORS, getColliderComps, addExplosion } from '../utils';
import levels from '../levels';
import { createPlayer, destroyPlayer, addPlayerColliders, registerPlayerActions } from '../entities/player';
import { moverProps, kickableProps } from '../entities';
import { addFlierParts } from '../entities/flier'; 
import { addStanderParts } from '../entities/stander';
import { registerCollisions } from '../events/collisions';
import state, { resetLevelState, speedModifier } from '../state';
import loadLevel from '../loadLevel';

// general game consts
const GRAVITY = 0.2;
const STARTING_AMMO_COUNT = 5;
const STARTING_SMOKE_BOMB_COUNT = 3;

const WALL_COLLIDER_THICKNESS = 16;

// launch arrow consts
const LAUNCH_ARROW_SPEED = 0.75;
const LAUNCH_ARROW_MIN_ANGLE = 0;
const LAUNCH_ARROW_MAX_ANGLE = 90;
const LAUNCH_ARROW_STRENGHT_SPEED = 0.01;
const LAUNCH_ARROW_SCALE = 0.5;
const LAUNCH_ARROW_MAX_STRENGTH = 2;
const LAUNCH_ARROW_STRENGTH_MODIFIER = 10;
const LAUNCH_ARROW_BOSS_BATTLE_OPACITY = 0.5

// throw arrow consts
const THROW_ARROW_SPEED = 2;

// blade
const BLADE_SPEED = 1000;
const BLADE_START_DISTANCE = 50;

const launchArrowComps = [
  "launchArrow",
  sprite("arrow"),
  scale(LAUNCH_ARROW_SCALE, LAUNCH_ARROW_SCALE),
  rotate(0),
  origin("center"),
  area(),
  layer("ui"),
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
  layer("ui"),
];

k.scene("game", (args = {}) => {
  resetLevelState();

  // game state
  let currentLevel;
  let ammoCount = STARTING_AMMO_COUNT;
  let smokeBombCount = STARTING_SMOKE_BOMB_COUNT;

  // level state
  let previousMouseDown;
  let misses;
  
  let launchArrow;
  let overlay;
  let ammoCounter;
  let smokeBombCounter;


  let startingPosition;

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

    state.currentBuilding = (state.currentBuilding + 1) % 3;
    const nextBuilding = (state.currentBuilding + 1) % 3;

    ammoCount += state.level.ammoRecovered;

    ammoCounter = add([
      "ammoCounter",
      text(getAmmoCounterText(), { size: 24 }),
      pos(1*UNITS, 1*UNITS),
      layer('ui'),
      color(ammoCount > 0 ? COLORS.WHITE : COLORS.RED),
    ]);

    smokeBombCounter = add([
      "smokeBombsCounter",
      text(getSmokeBombCounterText(), { size: 24 }),
      pos(1*UNITS, 2*UNITS),
      layer('ui'),
      color(smokeBombCount > 0 ? COLORS.WHITE : COLORS.RED),
    ]);

    currentLevel = newLevel;
    resetLevelState();
    previousMouseDown = mouseIsDown();
    state.level.ammoRecovered = 0;
    misses = 0;

    add([
      "sky",
      sprite("background"),
      scale(0.5),
      layer("bg"),
    ]);

    overlay = add([
      rect(width(), height()),
      color(0, 0, 0),
      opacity(0.25),
      layer("bg"),
    ]);

    overlay.action(() => {
      if (state.level.isSlowMo) {
        overlay.opacity = wave(0.25, 0.5, 1000);
      } else {
        overlay.opacity = 0.25;
      }
    });

    loadLevel(levels[currentLevel], state.currentBuilding, nextBuilding);

    state.level.isBossBattle = get("bossEye").length > 0;

    const player = get("player")[0];
    addPlayerColliders(player);
    player.play("landing");
    startingPosition = {...player.pos};

    every("wall", wall => {
      add([
        layer('ui'),
        "wallCollider",
        rect(WALL_COLLIDER_THICKNESS, 1*UNITS),
        ...getColliderComps(COLORS.PURPLE),
        pos(wall.pos.add(-WALL_COLLIDER_THICKNESS, 0)),
        origin("topleft"),
        area(),
      ]);
    });

    every("flier", flier => {
      add([
        layer('ui'),
        "landCollider",
        rect(1*UNITS, 0.5*UNITS),
        ...getColliderComps(COLORS.PURPLE),
        pos(flier.pos.add(0, 0.5*UNITS)),
        follow(flier, vec2(0, 0.5*UNITS)),
        origin("botleft"),
        area(),
        {
          owner: flier,
        },
      ])
    });

    // launch arrow
    launchArrow = add([...launchArrowComps, pos(player.pos.sub(0.02*UNITS, 0)), opacity(state.level.isBossBattle ? LAUNCH_ARROW_BOSS_BATTLE_OPACITY : 1)]);

    // throw arrow
    add([...throwArrowComps, follow(player)]);

    addFlierParts();
    addStanderParts();
  }

  startLevel(0);

  /**
   * Event Handling
   */

  const reset = () => {
    useSmokeBomb();
    destroyPlayer();
    console.trace('hwhy');
    destroyAll("throwArrow");
    launchArrow.destroy();
    state.level.isSlowMo = false;
    let player = add(createPlayer([pos(startingPosition)]));
    addPlayerColliders();
    player.play("landing");
    launchArrow = add([...launchArrowComps, pos(startingPosition)]);
    add([...throwArrowComps, follow(player)]);
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
    console.log('callingStartThrow');
    const player = get("player")[0];
    const throwArrow = get("throwArrow")[0];
    player.isThrowing = true;
    state.level.isSlowMo = true;
    throwArrow.opacity = 1;
  };

  // for some reason, just "getting" the player wasn't working, so passing it in
  const endThrow = (player) => {
    const throwArrow = get("throwArrow")[0];
    throwArrow.opacity = 0;
    throwArrow.angle = 0;
    player.isThrowing = false;
    console.log('what is happening?', player.isThrowing)
    state.level.isSlowMo = false;
  }
  const throwBlade = () => {
    const player = get("player")[0];
    player.play("throwing");
    const throwArrow = get("throwArrow")[0];
    const bladePos = throwArrow.pos.add(dir(throwArrow.angle - 90).scale(BLADE_START_DISTANCE));
    add([
      "blade",
      rect(10, 10),
      area(),
      pos(bladePos),
      z(5),
      {
        speed: BLADE_SPEED,
        throwAngle: throwArrow.angle - 90,
        isRecovered: false,
        ...moverProps,
      }
    ]);
    useAmmo();
  };

  const gameAction = () => {
    const player = get("player")[0];
    if (player.state === "launched" && !player.isThrowing && !player.isKicking && !state.level.isRecovering) {
      ammoCount > 0 ? startThrow() : flashAmmo();
    } else if (player.isThrowing) {
      ammoCount > 0 ? throwBlade() : flashAmmo();
    } else if (state.level.isWon) {
      if (currentLevel + 1 === levels.length) {
        go("win");
      } else {
        startLevel(currentLevel + 1);
      }
    }
  }

  const actionDown = () => {
    const player = get("player")[0];
    if (player.state === "prelaunch" && !state.level.isRecovering) {
      player.state = "launching";
    }
  }

  const actionUp = () => {
    const player = get("player")[0];

    if (player.state === "launching") {
      player.state = "launched"
      const start = vec2(0,0);
      const direction = state.level.isBossBattle ? 90 : LAUNCH_ARROW_MAX_ANGLE - launchArrow.angle
      const end = start.add((dir(direction).scale(launchArrow.scale.scale(LAUNCH_ARROW_STRENGTH_MODIFIER))));

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
      let delay = 0;
      every("enemy", enemy => {
        wait(delay, () => {
          addExplosion(enemy.pos);
          enemy.eye && enemy.eye.destroy();
          enemy.destroy();
        });
        delay += 0.25;
      });
    });
 
    wait(2, () => {
      const stats = add([
        rect(10*UNITS, 6*UNITS),
        area(),
        color(COLORS.BLACK),
        pos(16*UNITS, 2*UNITS),
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
            "ammoRecovered",
            text(`Ammo Recovered: ${state.level.ammoRecovered}`, { size: 14 }),
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

            state.level.isWon = true;
          });
        }); 
      });
    });
  }

  const incompleteLevel = () => {
    wait(1, () => {
      every("enemy", enemy => {
        if (!enemy.disabled && !state.level.isBossBattle) {
          if (enemy.eye) {
            enemy.eye.frame = 8;
          }
        }
      });
    });

    wait(2, () => {
      const player = get("player")[0];
      if (state.level.isBossBattle) {
        player.state = "prelaunch";
      } else {
        attemptReset();
      }
    })
  };

  const checkEnd = () => {
    const player = get("player")[0];
    let isEnded = player.state === "landed";
    every("blade", blade => {
      if (blade.speed > 0) {
        isEnded = false;
      }
    })

    if (isEnded) {
      let isVictory = true;
      every("target", target => {
        if (!target.disabled) {
          isVictory = false;
        }
      });

      if (isVictory) {
        winLevel();
      } else {
        incompleteLevel();
      }
    }
  };

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
      kickable.moveBy(kickable.kickDirection < 0 ? 40 : 0, 0);
    }
  });

  // launch arrow movement
  let direction = 1;
  action("launchArrow", launchArrow => {
    const player = get("player")[0];

    if (player.state === "prelaunch") {
      if (state.level.isRecovering) {
        launchArrow.opacity = 0;
      } else {
        launchArrow.opacity = state.level.isBossBattle ? LAUNCH_ARROW_BOSS_BATTLE_OPACITY : 1;
      }

      if (!state.level.isBossBattle) {
        if (launchArrow.angle <= LAUNCH_ARROW_MIN_ANGLE) {
          direction = 1;
        } else if (launchArrow.angle >= LAUNCH_ARROW_MAX_ANGLE) {
          direction = -1;
        }
        launchArrow.angle = launchArrow.angle + (direction * LAUNCH_ARROW_SPEED);
      }
    } else if (player.state === "launching") {
      if (launchArrow.scale.x <= LAUNCH_ARROW_MAX_STRENGTH) {
            launchArrow.scale = launchArrow.scale.add(LAUNCH_ARROW_STRENGHT_SPEED, LAUNCH_ARROW_STRENGHT_SPEED);
      }
    } else if (player.state === "launched") {
      launchArrow.opacity = 0;
      launchArrow.scale = vec2(LAUNCH_ARROW_SCALE, LAUNCH_ARROW_SCALE);
    }
  })

  // throw arrow movement
  action("throwArrow", throwArrow => {
    const player = get("player")[0];

    if (state.level.isSlowMo) {
      throwArrow.angle += THROW_ARROW_SPEED;
      if (throwArrow.angle === 360 || state.level.isRecovering) {
        endThrow(player);
        player.state = "afterThrow";
      }
    }
  });

  action("mover", mover => {
    mover.moveBy(mover.sideSpeed * speedModifier(), -mover.upSpeed * speedModifier());

    if (!state.level.isSlowMo) {
      mover.upSpeed -= gravity;  
    }
  });

  action("shake", shakeable => {
    if (shakeable.pos.y <= shakeable.shakeTop) {
      shakeable.direction = 1;
    } else if (shakeable.pos.y >= shakeable.shakeBottom) {
      shakeable.direction = -1;
    }

    console.log(shakeable.direction)
    shakeable.moveBy(0, shakeable.direction * 0.5*UNITS);
  });

  action("animated", animated => {
    animated.animSpeed = speedModifier();
  });

  action("eye", eye => {
    const player = get("player")[0];
    if (eye.disabled || (eye.owner && eye.owner.disabled)) {
      eye.angle = 0;
    } else {
      eye.angle = eye.pos.angle(player.pos) + 90;
    }
  });

  registerPlayerActions({ attemptReset });
  registerCollisions({ endThrow, checkEnd });
});
