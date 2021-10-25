import k from './kaboom';
import { UNITS } from './constants'
import state from './state'

export const isDebugging = false ;

export const COLORS = {
  WHITE: rgb(194, 225, 223),
  BLACK: rgb(32, 38, 37),
  GREY: rgb(180, 180, 160),
  DARK_GREY: rgb(65, 75, 74),
  RED: rgb(240, 50, 50),
  GREEN: rgb(60, 230, 110),
  PURPLE: rgb(200, 100, 200),
  DARK_BLUE: rgb(48, 74, 78),
  MED_BLUE: rgb(121, 186, 195),
  LIGHT_BLUE: rgb(145, 223, 234),
}

export const getColliderComps = (colliderColor) => ([
  color(colliderColor),
  opacity(isDebugging ? 0.5 : 0),
]);

export const flash = (entity, color = COLORS.WHITE) => {
    entity.color = color;
    wait(0.2, () => {
      entity.color = undefined;
    });
}

export const shakeEntity = (entity) => {
  entity.shakeTop = entity.pos.y - 0.25*UNITS
  entity.shakeBottom = entity.pos.y
  entity.use("shake");
  wait(0.25, () => {
    entity.unuse("shake");
  });
}

export const addExplosion = position => {
  const explosion = add([
    "explosion",
    sprite("explosion"),
    pos(position),
    scale(0.5, 0.5),
    origin("center"),
    z(4),
  ]);

  play("explosion");
  explosion.play("main", { onEnd: () => {
    explosion.destroy();
  }});
  wait(0.1, () => {  shake(20) })
}

export const addFade = (fadeIn, onEnd) => {
  let multiplier = 1;
  const fade = add([
    "fadeIn",
    rect(32*UNITS, 18*UNITS),
    pos(0, 0),
    color(COLORS.BLACK),
    layer("ui"),
    z(1000),
    opacity(fadeIn ? 1 : 0),
  ]);

  fade.action(() => {
    fade.opacity -= (fadeIn ? 0.001 : -0.001) * multiplier;
    multiplier += 0.25;
    if ((fadeIn && fade.opacity <= 0) || fade.opacity >= 1) {
      fade.destroy();
      onEnd && onEnd();
    }
  });
};

export const addScore = (scoreToAdd) => {
  state.score += scoreToAdd.value;

  const scoreCounter = get("scoreCounter")[0];
  if (scoreCounter) {
    scoreCounter.text = `SCORE: ${state.score}`;
  }

  const scoreText = get("scoreText")[0];
  if (scoreText) {
    const isPositive = scoreToAdd.value > 0;
    scoreText.text = `${scoreToAdd.text}   ${isPositive ? '+' : ''}${scoreToAdd.value}`;
    if (isPositive) {
      scoreText.color = COLORS.LIGHT_BLUE;
    } else {
      scoreText.color = COLORS.RED;
    }
    scoreText.opacity = 1;
    scoreText.timer = 5 * 60;
  }
}
