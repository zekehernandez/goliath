import k from "./kaboom";

export const START_JUMP_END_FRAME = 31;
export const LANDING_END_FRAME = 35;
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
  k.loadSprite("kunai", "sprites/kunai.png");
  k.loadSprite("background", "sprites/background.png");
  k.loadSprite("title", "sprites/title.png");
  k.loadSprite("explosion", "sprites/explosion.png", {
    sliceX: 12,
    sliceY: 1,
    anims: {
      main: {
          from: 1,
          to: 11,
      },
    },
  });
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
      height: 768,
      sliceX: 3,
      sliceY: 4,
      anims: {
        idle: { from: 0, to: 0 },
        charging: { from: 3, to: 5 },
        shooting: { from: 6, to: 8 },
        disabled: { from: 9, to: 9 },
      },
    },
  });
  k.loadSpriteAtlas("sprites/player_atlas.png", {
    "player": {
      x: 0,
      y: 0,
      width: 96*9,
      height: 96*7,
      sliceX: 9,
      sliceY: 7,
      anims: {
        idle: { from: 9, to: 9 },
        crouch: { from: 18, to: 18 },
        startJump: { from: 27, to: START_JUMP_END_FRAME },
        somersault: { from: 32, to: 32  },
        landing: { from: 34, to: LANDING_END_FRAME },
        throwing: { from: 36, to: 38 },
        // falling: { from: 75, to: FALLING_END_FRAME },
        kicking: { from: 54, to: 54 },
        smokeBomb: { from: 1, to: 4 },
      },
    },
  });
  k.loadSpriteAtlas("sprites/stander_atlas.png", {
    "stander": {
      x: 0,
      y: 0,
      width: 1152,
      height: 1152,
      sliceX: 6,
      sliceY: 3,
      anims: {
        idle: { from: 0, to: 5 },
        disabled: { from: 6, to: 11 },
        kicked: { from: 12, to: 13 },
      },
    },
  });
  k.loadSpriteAtlas("sprites/flier_atlas.png", {
    "flier": {
      x: 0,
      y: 0,
      width: 96 * 8,
      height: 96 * 2,
      sliceX: 8,
      sliceY: 2,
      anims: {
        idle: { from: 0, to: 5 },
        disabled: { from: 8, to: 15 },
      },
    },
  });
  k.loadSprite("thruster", "sprites/thruster.png", {
    sliceX: 3,
    sliceY: 1,
    anims: {
      main: {
          from: 0,
          to: 2,
      },
    },
  })

  for (let i = 0; i < BUILDING_COUNT; i++) {
    loadBuilding(i);
  } 


  k.loadSound("bigHit", "sounds/title.wav");
  k.loadSound("intro", "sounds/intro.wav");
  k.loadSound("explosion", "sounds/explosion.wav");
  k.loadSound("bossDeath", "sounds/boss_death.wav")
  k.loadSound("disabledFlier", "sounds/disabled-flier.wav");
  k.loadSound("disabledTallbot", "sounds/disabled-tallbot.wav");
  k.loadSound("mainGame", "sounds/main_game.mp3");
  k.loadSound("bossMoving", "sounds/moving.wav");
  k.loadSound("rising", "sounds/rising.wav");
  k.loadSound("hit", 'sounds/hit.wav');
  k.loadSound("handRaise", "sounds/hit.wav");
  k.loadSound("charging", "sounds/charging.wav");
  k.loadSound("laser", "sounds/laser.wav");
};

export default loadAssets;
