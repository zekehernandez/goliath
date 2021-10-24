import { UNITS } from '../constants';
import { COLORS, getColliderComps } from '../utils';
import { kickableProps } from './'
import state, { resetLevelState, speedModifier } from '../state';

export const createStander = () => {
  return [
    "enemy",
    "target",
    "kickable",
    "stander",
    "animated",
    sprite("stander"),
    area(),
    body(),
    scale(0.4),
    origin("center"),
    {
      disabled: false,
      ...kickableProps,
    },
  ];
};

export const addStanderParts = () => {
  every("stander", stander => {
    stander.play("idle", { loop: true, speed: 4, pingpong: true });

    const standerHurtbox = add([
      "enemyHurtbox",
      rect(0.65*UNITS, 2.9*UNITS),
      pos(stander.pos),
      area(),
      origin("center"),
      follow(stander, vec2(4, 8)),
      ...getColliderComps(),
      {
        owner: stander,
      },
    ]);

    const eye = add([
      "eye",
      sprite("bossEye"),
      pos(stander.pos),
      scale(0.12),
      origin("center"),
      follow(stander, vec2(-6, -43)),
      z(1),
      {
        owner: stander,
      },
    ])

    eye.play("idle");
    stander.eye = eye;
  });

  action("stander", stander => {
    if (stander.disabled) {
      stander.eye.destroy();
    }
  });
};
