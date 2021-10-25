import k from '../kaboom';
import { COLORS } from '../utils';
import { UNITS } from '../constants'
import { addConversation, registerTextActions } from '../entities/text';

k.scene("intro", (args = {}) => {
  let isAnimating = true;

  const background = add([
    sprite("background"),
    scale(0.5),
    layer("bg"),
    pos(-10*UNITS, -6*UNITS),
  ]);

  const bottomBar = add([
    rect(32*UNITS, 18*UNITS),
    color(COLORS.BLACK),
    pos(16*UNITS, 0*UNITS),
    origin("top"),
  ]);

  add([
    rect(8*UNITS, 18*UNITS),
    color(COLORS.BLACK),
  ]);

  add([
    rect(0.25*UNITS, 18*UNITS),
    color(COLORS.BLACK),
    pos(12*UNITS, 0) ,
  ]);

  add([
    rect(0.25*UNITS, 18*UNITS),
    color(COLORS.BLACK),
    pos(20*UNITS, 0),
  ]);

  add([
    rect(8*UNITS, 18*UNITS),
    color(COLORS.BLACK),
  ]);

  add([
    pos(24*UNITS, 0),
    rect(8*UNITS, 18*UNITS),
    color(COLORS.BLACK),
  ]);

  const character = add([
    sprite("player", { flipX: true }),
    pos(16*UNITS, bottomBar.pos.y),
    origin("bot"),
    follow(bottomBar, vec2(3.25*UNITS, 0)),
    color(COLORS.BLACK),
  ]);

  const topBar = add([
    rect(32*UNITS, 6*UNITS),
    color(COLORS.BLACK),
    pos(bottomBar.pos),
    origin("bot"),
    follow(bottomBar, vec2(0, -4*UNITS)),
  ]);

  const introSong = play("intro", { loop: true });

  action(() => {
    if (isAnimating) {
      bottomBar.pos.y += 0.75;
      background.pos.y += 0.25;

      if (bottomBar.pos.y >= 8*UNITS) {
        isAnimating = false;
        addConversation("intro", 2, () => {
          introSong.stop();
          go("title");
        }, true);
      }
    }
  });

  registerTextActions();
});
