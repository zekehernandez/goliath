import k from '../kaboom';
import { UNITS } from '../constants';

k.scene("instructions", (args = {}) => {
  add([
    "background",
    sprite("background"),
      scale(0.5),
  ])

  overlay = add([
    rect(width(), height()),
    color(0, 0, 0),
    opacity(0.75),
    layer("bg"),
  ]);

  add([
    text("HOW TO PLAY", { size: 60 }),
    origin("center"),
    pos(16*UNITS, 2*UNITS),
  ]);

  const body = 
  "The goal of this (very WIP) game is to elimate threats (green rectangles) on each rooftop. \n\n" +
  "This is done by throwing your energy kunai (just white dots) at the targets. \n\n" + 
  "You have limited ammo, so take your shots carefully!"

  add([
    text(body, { size: 32, width: 20*UNITS, }),
    origin("top"),
    pos(16*UNITS, 3*UNITS),
  ]);

  add([
    text("Controls", { size: 48 }),
    origin("center"),
    pos(16*UNITS, 10*UNITS),
  ]);

  const controls = 
  "1.) When your Launch Arrow is pointed in the direction you want. Click and hold to start the jump. The longer you hold, the stronger the jump. Release to jump. \n\n" +
  "2.) While in the air, click to enter slow motion targeting (once per jump). When the Targeting Arrow is pointed towards where you want to throw, click to throw a kunai. \n\n" + 
  ""

  add([
    text(controls, { size: 32, width: 20*UNITS, }),
    origin("top"),
    pos(16*UNITS, 11*UNITS),
  ]);


  const cta = add([
    "cta",
    text("Click to play", { size: 30 }),
    pos(31*UNITS, 17*UNITS),
    origin("right"),
    opacity(0),
  ]);

  loop(0.75, () => {
    if (cta.opacity === 0) {
      cta.opacity = 1;
    } else {
      cta.opacity = 0;
    }
  });

  mouseClick(() => k.go("game"))
});
