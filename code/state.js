const defaultLevel = {
  isWon: false,
  isSlowMo: false,
  ammoRecovered: 0,
  misses: 0,
  isBossBattle: false,
  isRecovering: false,
};

const state = {
  level: {
    ...defaultLevel,
  },
  health: 3,
  currentBuilding: -1,
};

export const resetLevelState = () => {
  state.level = { ...defaultLevel };
};

export const SLOW_MO_MODIFIER = 0.045;
export const speedModifier = () => state.level.isSlowMo ? SLOW_MO_MODIFIER : 1;

export default state;
