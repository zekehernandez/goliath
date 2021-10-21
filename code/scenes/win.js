import k from '../kaboom';

k.scene("win", (args = {}) => {
  add([
    "background",
    rect(width(), height()),
    color(20, 20, 40),
  ])

  add([
      "title",
      text("You Win!", { size: 60 }),
      origin("center"),
      pos(center().x, center().y - 100),
  ]);

  const cta = add([
    "cta",
    text("Click to play again", { size: 30 }),
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
