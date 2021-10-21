import k from "./kaboom";
import "./scenes/index.js"; // initializes all scenes


export const START_JUMP_END_FRAME = 49;
export const LANDING_END_FRAME = 59;

// load assets
k.loadSprite("bean", "sprites/bean.png");
k.loadSprite("arrow", "sprites/arrow.png");
k.loadSpriteAtlas("sprites/player_atlas.png", {
  "player": {
    x: 0,
    y: 0,
    width: 720,
    height: 336,
    sliceX: 15,
    sliceY: 7,
    anims: {
      idle: { from: 15, to: 21 },
      crouch: { from: 30, to: 35 },
      startJump: { from: 47, to: START_JUMP_END_FRAME },
      somersault: { from: 50, to: 55   },
      landing: { from: 58, to: LANDING_END_FRAME },
      throwing: { from: 60, to: 60 },
      falling: { from: 75, to: 77 },
      kicking: { from: 90, to: 90 },
    },
  },
});

k.go("game");
