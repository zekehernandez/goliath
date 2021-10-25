import k from '../kaboom';
import { COLORS } from '../utils';
import { UNITS } from '../constants';
import state from '../state';

k.scene("win", (args = {}) => {
  add([
    "background",
    rect(width(), height()),
    color(COLORS.DARK_BLUE),
  ])

  add([
      "title",
      text("YOU WIN", { size: 60 }),
      origin("center"),
      pos(16*UNITS, 6*UNITS),
  ]);

  add([
    text("Final Score:", { size: 40 }),
    origin("center"),
    pos(16*UNITS, 9*UNITS),
  ]);
  
  add([
    text(`${state.score}`, { size: 120 }),
    origin("center"),
    pos(16*UNITS, 11*UNITS),
  ]);

  const cta = add([
    "cta",
    text("Click to play again", { size: 30 }),
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
