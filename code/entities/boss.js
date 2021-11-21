import { UNITS } from '../constants';
import { COLORS, flash, shakeEntity, getColliderComps, addScore } from '../utils';
import state, { speedModifier, SCORES } from '../state';
import { shakeableProps } from './'

const MOVE_SPEED = 8*UNITS;
const MIN_TARGET_SEARCH_TIME = 0.5;
const MIN_STEPS = 3;
const MAX_STEPS = 5;
const ACCELERATION_SPEED = 20;
const CHARGING_TIME = 80;
const SHOOTING_TIME = 120;
const HEALTH = 3;

export const createBoss = () => {
  const bossTargets = get("bossTarget");
  const tops = get("top");
  const rooftop = tops[Math.floor(tops.length / 2)];
  const heightModifer = -1.75*UNITS;

  let searchingForTarget = false;
  let acceleration = 0;
  let stepsTilNextPhase = Math.floor(rand(MIN_STEPS, MAX_STEPS));
  let inPhase;

  let laserSound;
  let chargingSound;

  const bossHead = add([
    "bossHead",
    sprite("bossHead"),
    scale(0.5),
    pos(16*UNITS, rooftop.pos.y - 10*UNITS),
    origin("center"),
    z(2),
  ]);

  let bossTarget = choose(bossTargets);
  let bossSpeed = bossHead.pos.dist(bossTarget);

  const bossEye = add([
    "eye",
    "bossEye",
    "target",
    "animated",
    sprite("bossEye"),
    scale(0.5),
    area(),
    pos(bossHead.pos),
    follow(bossHead, vec2(8, 0.5*UNITS)),
    origin("center"),
    z(3),
    {
      isCharging: false,
      isShooting: false,
      chargeTimer: CHARGING_TIME,
      shootTimer: SHOOTING_TIME,
      disabled: false,
      health: HEALTH,
      canAttack: true,
      ...shakeableProps,
    },
  ]);

  const bossLaser = add([
    "bossLaser",
    "animated",
    sprite("bossLaser", { height: 24*UNITS }),
    scale(0.5),
    area(),
    pos(bossEye.pos),
    follow(bossEye),
    origin("top"),
    opacity(0),
    z(3),
  ]);

  const createLaserCollider = () => {
    add([
      "bossLaserCollider",
      rect(2*UNITS, 2*UNITS),
      area(),
      pos(rooftop.pos),
      origin("bot"),
      z(4),
      opacity(),
      ...getColliderComps(COLORS.RED),
    ]);
  }


  const bossBlast = add([
    "bossBlast",
    "animated",
    sprite("bossBlast"),
    scale(0.6),
    pos(rooftop.pos.add(0, 0.25*UNITS)),
    origin("bot"),
    z(5),
    opacity(0),
  ]);
  bossBlast.play("main", { loop: true});

  const bossBody = add([
    "bossBody",
    sprite("bossBody"),
    rotate(0),
    scale(0.5, 0.75),
    origin("top"),
    pos(bossHead.pos),
    follow(bossHead),
    z(1),
  ]);

  const leftHand = add([
    "bossHand",
    "leftBossHand",
    sprite("bossHand", { flipX: false }),
    origin("center"),
    pos(16*UNITS - 6*UNITS, rooftop.pos.y + heightModifer),
    scale(0.75),
    z(4),
  ]);

  const rightHand = add([
    "bossHand",
    "rightBossHand",
    sprite("bossHand", { flipX: true }),
    origin("center"),
    pos(16*UNITS + 6*UNITS, rooftop.pos.y + heightModifer),
    scale(0.75),
    z(4),
  ]);

  const leftArm = add([
    rect(1*UNITS,10*UNITS),
    area(),
    color(COLORS.DARK_GREY),
    pos(bossBody.pos),
    follow(bossBody, vec2(-0.5*UNITS, 3*UNITS)),
    origin("top"),
  ])

  leftHand.action(() => {
    leftArm.angle = leftArm.pos.angle(leftHand.pos) + 90;
    leftArm.height = leftArm.pos.dist(leftHand.pos);
  });

  const slam = (isBig) => {
    leftHand.moveTo(leftHand.pos.sub(-0.5*UNITS, -4*UNITS), 200);
    rightHand.moveTo(rightHand.pos.sub(0.5*UNITS, -4*UNITS), 200);
  }

  const rightArm = add([
    rect(1*UNITS,10*UNITS),
    area(),
    color(COLORS.DARK_GREY),
    pos(bossBody.pos),
    follow(bossBody, vec2(0.5*UNITS, 3*UNITS)),
    origin("top"),
  ])

  rightHand.action(() => {
    rightArm.angle = rightArm.pos.angle(rightHand.pos) + 90;
    rightArm.height = rightArm.pos.dist(rightHand.pos);
  });

  const searchForTarget = () => {
    searchingForTarget = true;
    wait(rand(0.5, 3) + MIN_TARGET_SEARCH_TIME, () => {
      searchingForTarget = false;
      play("bossMoving");
      bossTarget = choose(bossTargets);
    })
  };

  const endPhase = () => {
    bossEye.isCharging = false;
    bossEye.isShooting = false;
    destroyAll("bossLaserCollider");
    bossLaser.opacity = 0;
    bossBlast.opacity = 0;
    bossEye.chargeTimer = CHARGING_TIME;
    bossEye.shootTimer = SHOOTING_TIME;
    stepsTilNextPhase = Math.floor(rand(MIN_STEPS, MAX_STEPS));
    inPhase = false;
    if (laserSound) {
      laserSound.stop();
    }
    if (chargingSound) {
      chargingSound.stop();
    }
  }

  const startNewPhase = () => {
    inPhase = true;
    wait(1, () => {
      bossEye.isCharging = true;
    });
  }

  bossHead.action(() => {
    const player = get("player")[0];
    if (!inPhase && !bossEye.disabled) {
      if (bossHead.pos.dist(bossTarget.pos) === 0) {
        if (!searchingForTarget) {
          stepsTilNextPhase--;
          acceleration = 0;

          if (stepsTilNextPhase === 0 && !state.level.isRecovering) {
            startNewPhase();
            return;
          }

          searchForTarget();
        }
      } else {
        bossHead.moveTo(bossTarget.pos, (MOVE_SPEED + acceleration) * speedModifier());
        if (!state.level.isSlowMo) {
          acceleration += ACCELERATION_SPEED;
        }
      }
    }
  });

  bossBody.action(() => {
    const newAngle = bossBody.pos.angle(vec2(16*UNITS, 18*UNITS)) + 90;
    bossBody.angle = newAngle;
  });

  bossEye.action(() => {
    const player = get("player")[0];

    const curAnim = bossEye.curAnim();
    if (bossEye.isCharging) {
      if (curAnim !== "charging") {
        chargingSound = play("charging");
        bossEye.play("charging", { loop: true, pingpong: true })
      } else {
        bossEye.chargeTimer -= 1 * speedModifier();
        if (bossEye.chargeTimer <= 0) {
          bossEye.isCharging = false;
          bossEye.chargeTimer = CHARGING_TIME;
          bossEye.isShooting = true;
          createLaserCollider();
          bossLaser.opacity = 1;
          bossBlast.opacity = 1;
        }
      }
    } else if (bossEye.isShooting) {
      if (curAnim !== "shooting") {
        laserSound = play("laser");
        bossEye.play("shooting", { loop: true, pingpong: true })
      } else {
        bossEye.shootTimer -= 1 * speedModifier();
        if (bossEye.shootTimer <= 0) {
          endPhase();
        }
      }
    } else if (bossEye.disabled) {
      if (inPhase) {
        play("bossDeath");
        endPhase(); 
      }
      if (bossHead.pos.y < rooftop.pos.y - 2*UNITS) {
        shake(10);
        bossHead.pos = bossHead.pos.add(0, 1);
      } else {
        bossEye.play("disabled");
      }

    } else if (curAnim !== "idle") {
      bossEye.play("idle", { loop: true })
    }
  });

  bossLaser.action(() => {
    const newAngle = bossLaser.pos.angle(rooftop.pos.add(0, 0.25*UNITS)) + 90;
    bossLaser.angle = newAngle;

    if (bossEye.isShooting) {
      shake(4);
    }
  });

  collides("blade", "bossEye", (blade, bossEye) => {
    if (bossEye.isCharging || bossEye.isShooting) {
      shake(10);
      bossEye.health--;
      play("hit");
      endPhase();
      if (bossEye.health <= 0) {
        bossEye.disabled = true;
        addScore(SCORES.BOSS_SUCCESS)
      } else {
        wait(1, () => {
          slam();
        });
      }
      shakeEntity(bossHead);
      flash(bossEye, COLORS.BLACK)
      blade.destroy();
    } else {
      blade.throwAngle += 270;
      shake(5);
      flash(bossEye);
    }
  });

  collides("bossLaserCollider", "player", (bossLaserCollider, player) => {
    if (bossEye.isShooting && !state.level.isRecovering) {
      state.level.energyCount--;

      if (state.level.energyCount <= 0) {
        wait(2, () => {
          go("continue");
        })
      }
      state.level.isRecovering = true;
      player.angle = 0;
      wait(3, () => {
        state.level.isRecovering = false;
      });
    }
  });
};

export const createBossTarget = () => {
  return [
    "bossTarget",
    rect(1*UNITS, 1*UNITS),
    area(),
    opacity(0),
  ]
};

