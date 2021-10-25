import k from '../kaboom';
import { COLORS, addFade } from '../utils';
import { UNITS } from '../constants'
import { addConversation, registerTextActions } from '../entities/text';
import { tileComps } from '../entities';
import levels, { cinematicLevel } from '../levels';

k.scene("cinematic", (args = {}) => {
  const launchId = args.launchId ?? 0;
  const landId = args.landId ?? 1;
  let isRising = false;

  let maestro = -1;

  const heightModifer = -1.75*UNITS;

  play("mainGame", { loop: true });

  add([
    "sky",
    sprite("background"),
    scale(0.5),
    layer("bg"),
  ]);

  addLevel(cinematicLevel, {
    // define the size of each block
    width: 48,
    height: 48,
    // define what each symbol means, by a function returning a comp list (what you'll pass to add())
    "_": () => [...tileComps, "launch", sprite(`building${launchId}`, { frame: 0 })],
    "A": () => [...tileComps, "launch", sprite(`building${launchId}`, { frame: 2 })],
    "B": () => [...tileComps, "launch", sprite(`building${launchId}`, { frame: 3 })],
    "C": () => [...tileComps, "launch", sprite(`building${launchId}`, { frame: 4 })],
    "D": () => [...tileComps, "launch", sprite(`building${launchId}`, { frame: 5 })],
    "E": () => [...tileComps, "launch", sprite(`building${launchId}`, { frame: 6 })],
    "F": () => [...tileComps, "launch", sprite(`building${launchId}`, { frame: 7 })],
    "T": () => [...tileComps, "land", sprite(`building${landId}`, { frame: 0 }), "top"],
    "0": () => [...tileComps, "land", sprite(`building${landId}`, { frame: 0 }), "wall"],
    "1": () => [...tileComps, "land", sprite(`building${landId}`, { frame: 2 }), "wall"],
    "2": () => [...tileComps, "land", sprite(`building${landId}`, { frame: 3 })],
    "3": () => [...tileComps, "land", sprite(`building${landId}`, { frame: 2 })],
    "4": () => [...tileComps, "land", sprite(`building${landId}`, { frame: 4 }), "wall"],
    "5": () => [...tileComps, "land", sprite(`building${landId}`, { frame: 5 })],
    "6": () => [...tileComps, "land", sprite(`building${landId}`, { frame: 4 })],
    "7": () => [...tileComps, "land", sprite(`building${landId}`, { frame: 6 }), "wall"],
    "8": () => [...tileComps, "land", sprite(`building${landId}`, { frame: 7 })],
    "9": () => [...tileComps, "land", sprite(`building${landId}`, { frame: 6 })],
  });

  const tops = get("top");
  const rooftop = tops[Math.floor(tops.length / 2)];

  const bossHead = add([
    sprite("bossHead"),
    scale(0.5),
    pos(16*UNITS, 16*UNITS),
    origin("center"),
    z(2),
  ]);

  const bossEye = add([
    sprite("bossEye"),
    scale(0.5),
    area(),
    pos(bossHead.pos),
    follow(bossHead, vec2(8, 0.5*UNITS)),
    origin("center"),
    z(3),
  ]);

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
    sprite("bossHand", { flipX: false }),
    origin("center"),
    pos(16*UNITS - 6*UNITS, rooftop.pos.y + heightModifer + 3.5*UNITS),
    scale(0.75),
    z(3),
  ]);

  const rightHand = add([
    sprite("bossHand", { flipX: true }),
    origin("center"),
    pos(16*UNITS + 6*UNITS, rooftop.pos.y + heightModifer + 3.5*UNITS),
    scale(0.75),
    z(3),
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

  const character = add([
    sprite("player"),
    pos(16*UNITS, rooftop.pos.y),
    origin("bot"),
    follow(rooftop),
    z(3),
  ]);

  addFade(true, () => {
    addConversation("bossCinematic1", 1, () => {
      shake(20);
      play("explosion");
      addConversation("bossCinematic2", 0.5, () => {
        wait(1, () => {
          shake(20);
            play("explosion");
          wait(2, () => {
            maestro = 0;
            play("handRaise");
          });
        });
      }, true)
    }, true)
  });

  bossHead.action(() => {
    if (isRising) {
      bossHead.pos.y -= 0.75;
      shake(1);

      if (bossHead.pos.y <= rooftop.pos.y - 10*UNITS) {
        isRising = false;
      }
    }
  });

  action(() => {
    if (maestro === 0) {
      const leftUpPos = vec2(10*UNITS, rooftop.pos.y - 4.5*UNITS)
      leftHand.moveTo(leftUpPos, 600);

      if (leftHand.pos.eq(leftUpPos)) {
        wait(0.75, () => {
          maestro = 1;
        })
      }
    } else if (maestro === 1) {
      const leftDownPos = vec2(10*UNITS, rooftop.pos.y + heightModifer)
      leftHand.moveTo(leftDownPos, 1200);

      if (leftHand.pos.eq(leftDownPos)) {
        maestro = 2;
        play("explosion");
        shake(10);
        character.play("landing");
      }
    } else if (maestro === 2) {
      addConversation("bossCinematic3", 0, () => {
        maestro = 3;
        play("handRaise");
      }, true);
    } else if (maestro === 3) {
      const rightUpPos = vec2(22*UNITS, rooftop.pos.y - 4.5*UNITS)
      rightHand.moveTo(rightUpPos, 600);

      if (rightHand.pos.eq(rightUpPos)) {
        wait(0.75, () => {
          maestro = 4;
        })
      }
    } else if (maestro === 4) {
      const rightDownPos = vec2(22*UNITS, rooftop.pos.y + heightModifer)
      rightHand.moveTo(rightDownPos, 1200);

      if (rightHand.pos.eq(rightDownPos)) {
        play("explosion");
        maestro = 6;
        shake(10);
        isRising = true;
         play("rising");
        addConversation("bossCinematic4", 1, () => {
          maestro = 5;
        }, true);
      }
    } else if (maestro === 5 && !isRising) {
      go("game", { level: levels.length - 1 });
    }
  });

  registerTextActions();
});
