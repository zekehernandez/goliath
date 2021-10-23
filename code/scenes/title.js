import k from '../kaboom';
import { UNITS } from '../constants';

k.scene("title", (args = {}) => {
  add([
    "background",
    sprite("title"),
      scale(0.5),
  ])

  const cta = add([
    "cta",
    text("Click to begin", { size: 30 }),
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

  mouseClick(() => k.go("instructions"))
});
