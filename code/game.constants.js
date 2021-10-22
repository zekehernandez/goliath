import k from './kaboom';

const isDebugging = false;

export const COLORS = {
  WHITE: rgb(255, 255, 255),
  BLACK: rgb(0, 0, 0),
  GREY: rgb(180, 180, 160),
  RED: rgb(240, 50, 50),
  GREEN: rgb(60, 230, 110),
  PURPLE: rgb(200, 100, 200),
}

export const getColliderComps = (colliderColor) => ([
  color(colliderColor),
  opacity(isDebugging ? 0.5 : 0),
]);
