import k from "./kaboom";

export const START_JUMP_END_FRAME = 49;
export const LANDING_END_FRAME = 59;
export const FALLING_END_FRAME = 77;
export const BUILDING_COUNT = 3;

const SPRITE_SIZE = 96;

const loadAssets = () => {
  const loadBuilding = (id) => {
    k.loadSprite(`building${id}`, `sprites/building${id}_atlas.png`, {
      sliceX: 2,
      sliceY: 4,
    });
  };

  // load assets
  k.loadSprite("bean", "sprites/bean.png");
  k.loadSprite("arrow", "sprites/arrow.png");
  k.loadSprite("background", "sprites/background.png");
  k.loadSprite("title", "sprites/title.png");
  k.loadSprite("bossHead", "sprites/goliath_head.png");
  k.loadSprite("bossBody", "sprites/goliath_body.png");
  k.loadSprite("bossHand", "sprites/goliath_hand.png");
  k.loadSprite("bossElbow", "sprites/goliath_elbow.png");
  k.loadSprite("bossLaser", "sprites/goliath_laser.png", {
    sliceX: 2,
    sliceY: 1,
    anims: {
        main: {
            from: 0,
            to: 1,
        },
    },
  });
  k.loadSprite("bossBlast", "sprites/goliath_blast.png", {
    sliceX: 3,
    sliceY: 1,
    anims: {
        main: {
            from: 0,
            to: 2,
        },
    },
  });
  k.loadSpriteAtlas("sprites/goliath_eye_atlas.png", {
    "bossEye": {
      x: 0,
      y: 0,
      width: 576,
      height: 576,
      sliceX: 3,
      sliceY: 3,
      anims: {
        idle: { from: 0, to: 0 },
        charging: { from: 3, to: 5 },
        shooting: { from: 6, to: 8 },
      },
    },
  });
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
        falling: { from: 75, to: FALLING_END_FRAME },
        kicking: { from: 90, to: 90 },
      },
    },
  });

  for (let i = 0; i < BUILDING_COUNT; i++) {
    loadBuilding(i);
  } 
};

export default loadAssets;
