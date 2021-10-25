import k from '../kaboom';
import { COLORS } from '../utils';
import { UNITS } from '../constants';

k.scene("continue", (args = {}) => {
  let countdownNumber = 10;

  add([
    "sky",
    sprite("background"),
    scale(0.5),
    layer("bg"),
  ]);

  add([
      "title",
      text("Continue?", { size: 80 }),
      origin("center"),
      pos(16*UNITS, 9*UNITS - 100),
  ]);

  const countdown = add([ 
    text(`${countdownNumber}`, { size: 120 }),
    origin("center"),
    pos(16*UNITS, center().y), 
  ])

  const cta = add([
    "cta",
    text("Click to try again", { size: 30 }),
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

  const iterateTimer = () => {
    countdownNumber--;
    if (countdownNumber < 0) {
      go("gameOver");
    } else {
      countdown.text = `${countdownNumber}`;
    }
  }

  loop(1.5, () => {
    iterateTimer();
  });

  mouseClick(() => k.go("game"))
});
