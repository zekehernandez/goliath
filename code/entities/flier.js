import { UNITS } from '../constants'
import { moverProps } from './'
import { COLORS, getColliderComps } from '../utils';
import state, { speedModifier } from '../state';

const HOVER_DISTANCE = 0.25*UNITS;
const FLIER_SCALE = 0.75;

export const createFlier = () => {
  return [
    "enemy",
    "target",
    "flier",
    sprite("flier"),
    scale(FLIER_SCALE),
    rotate(0),
    area(),
    solid(),
    origin("center"),
    z(1),
    {
      disabled: false,
      ...moverProps,
    },
  ];
}

export const addFlierParts = () => {
  every("flier", flier => {
    flier.play("idle", { loop: true, speed: 8 });
    flier.startingHeight = flier.pos.y;

    const flierHurtbox = add([
      "flierHurtbox",
      "enemyHurtbox",
      rect(1*UNITS, 1.25    *UNITS),
      pos(flier.pos),
      area(),
      origin("center"),
      follow(flier, vec2(0, 0)),
      ...getColliderComps(),
      {
        owner: flier,
      },
    ]);

    const eye = add([
      "eye",
      sprite("bossEye"),
      pos(flier.pos),
      scale(0.15),
      origin("center"),
      follow(flier, vec2(0, -16)),
      z(1),
      {
        owner: flier,
      },
    ])

    eye.play("idle");

    const thruster = add([
      "thruster",
      "animated",
      sprite("thruster"),
      pos(flier.pos),
      scale(FLIER_SCALE),
      origin("top"),
      follow(flier, vec2(0, 0.74*UNITS)),
    ])
    thruster.play("main", { loop: true });

    flier.thruster = thruster;
    flier.eye = eye
  });

  let direction = -1;
  action("flier", flier => {
    if (!flier.disabled) {
      const player = get("player")[0]

      if (flier.alerted && player && player.state === 'launched') {
        flier.moveTo(player.pos, 40);
      } else {
        if (flier.pos.y < flier.startingHeight - HOVER_DISTANCE) {
          direction = 1;
        } else if (flier.pos.y > flier.startingHeight + HOVER_DISTANCE) {
          direction = -1;
        }

        const distanceFromStart = Math.abs(flier.startingHeight - flier.pos.y);
        const speed = Math.abs(HOVER_DISTANCE - distanceFromStart);
        
        flier.pos.y = flier.pos.y + (direction * (1 + speed/64) * speedModifier()); 
      }
    }
  });
}
