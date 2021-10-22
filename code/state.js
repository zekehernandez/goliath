const defaultLevel = {
  isWon: false,
  isSlowMo: false,
  ammoRecovered: 0,
  misses: 0,
};

const state = {
  level: {
    ...defaultLevel,
  },
  currentBuilding: -1,
};

export const resetLevelState = () => {
  state.level = { ...defaultLevel };
};

export default state;
