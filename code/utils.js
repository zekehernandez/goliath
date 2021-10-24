import k from './kaboom';
import { UNITS } from './constants'
const isDebugging = false;

export const COLORS = {
  WHITE: rgb(194, 225, 223),
  BLACK: rgb(32, 38, 37),
  GREY: rgb(180, 180, 160),
  DARK_GREY: rgb(65, 75, 74),
  RED: rgb(240, 50, 50),
  GREEN: rgb(60, 230, 110),
  PURPLE: rgb(200, 100, 200),
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

  explosion.play("main", { onEnd: () => {
    explosion.destroy();
  }});
  wait(0.1, () => {  shake(20) })
}
