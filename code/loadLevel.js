import { UNITS } from './constants';
import { COLORS, getColliderComps } from './game.constants';
import { moverProps, kickableProps, tileComps } from './entities';
import { createPlayer } from './entities/player';

const loadLevel = (level, launchId, landId) => {
  addLevel(level, {
    // define the size of each block
    width: 48,
    height: 48,
    // define what each symbol means, by a function returning a comp list (what you'll pass to add())
    "@": () => createPlayer(),
    "_": () => [...tileComps, "launch", sprite(`building${launchId}`, { frame: 0 })],
    "A": () => [...tileComps, "launch", sprite(`building${launchId}`, { frame: 2 })],
    "B": () => [...tileComps, "launch", sprite(`building${launchId}`, { frame: 3 })],
    "C": () => [...tileComps, "launch", sprite(`building${launchId}`, { frame: 4 })],
    "D": () => [...tileComps, "launch", sprite(`building${launchId}`, { frame: 5 })],
    "E": () => [...tileComps, "launch", sprite(`building${launchId}`, { frame: 6 })],
    "F": () => [...tileComps, "launch", sprite(`building${launchId}`, { frame: 7 })],
    "T": () => [...tileComps, "land", sprite(`building${landId}`, { frame: 0 })],
    "0": () => [...tileComps, "land", sprite(`building${landId}`, { frame: 0 }), "wall"],
    "1": () => [...tileComps, "land", sprite(`building${landId}`, { frame: 2 }), "wall"],
    "2": () => [...tileComps, "land", sprite(`building${landId}`, { frame: 3 })],
    "3": () => [...tileComps, "land", sprite(`building${landId}`, { frame: 2 })],
    "4": () => [...tileComps, "land", sprite(`building${landId}`, { frame: 4 }), "wall"],
    "5": () => [...tileComps, "land", sprite(`building${landId}`, { frame: 5 })],
    "6": () => [...tileComps, "land", sprite(`building${landId}`, { frame: 4 })],
    "7": () => [...tileComps, "land", sprite(`building${landId}`, { frame: 6 }), "wall"],
    "8": () => [...tileComps, "land", sprite(`building${landId}`, { frame: 7 })],
    "9": () => [...tileComps, "land", sprite(`building${landId}`, { frame: 6 })],
    "x": () => [
      "enemy",
      "kickable",
      rect(1*UNITS, 2*UNITS),
      area(),
      body(),
      color(COLORS.GREEN),
      origin("left"),
      outline(),
      {
        disabled: false,
        ...kickableProps,
      },
    ],
    "o": () => [
      "enemy",
      "flier",
      rect(1*UNITS, 1*UNITS),
      area(),
      solid(),
      color(COLORS.GREEN),
      origin("left"),
      outline(),
      {
        disabled: false,
        ...moverProps,
      },
    ],
  });
}

export default loadLevel;
