import k from '../kaboom';
import { COLORS } from '../utils';

k.scene("gameOver", (args = {}) => {
  add([
    "background",
    rect(width(), height()),
    color(COLORS.BLACK),
  ])

  add([
      "title",
      text("GAME OVER", { size: 60 }),
      origin("center"),
      pos(center().x, center().y - 100),
  ]);

  const cta = add([
    "cta",
    text("Click to try again", { size: 30 }),
    origin("center"),
    pos(center().x, center().y + 50),
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
