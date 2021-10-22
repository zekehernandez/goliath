const defaultLevel = {
  isWon: false,
  isSlowMo: false,
  ammoRecovered: 0,
  misses: 0,
};

const state = {
  level: {
    ...defaultLevel,
  }
};

export const resetLevelState = () => {
  state.level = { ...defaultLevel };
};

export default state;
