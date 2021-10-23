import { UNITS } from '../constants';

export const moverProps = {
  sideSpeed: 0,
  upSpeed: 0,
};

export const kickableProps = {
  kickDirection: 0,
};

export const tileComps = [
  area(),
  solid(),
  scale(0.5),
  z(4),
];

export const shakeableProps = {
  shakeTop: 0,
  shakeBottom: 0,
  direction: -1,
}
