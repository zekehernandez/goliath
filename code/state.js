export const SCORES = {
  SUCCESS: {text: 'Cleared Rooftop', value: 500},
  FALL: {text: 'Fall', value: -40},
  MISS: {text: 'Kunai Miss', value: -20},
  KUNAI_HIT: {text: 'Kunai Hit', value: 200},
  KICK: {text: 'Good Kick', value: 180},
  BOSS_SUCCESS: {text: 'You Won', value: 1000},
};

const defaultLevel = {
  isWon: false,
  isSlowMo: false,
  isBossBattle: false,
  isRecovering: false,
  ammoCount: 6,
  energyCount: 3,
};

const state = {
  level: {
    ...defaultLevel,
  },
  currentBuilding: -1,
  isPaused: false,
  pastConversations: new Set(),
  conversationQueue: [],
  currentLevel: 0,
  score: 1000,
};

/** Notably doesn't reset pastConversations */
export const softReset = () => {
  state.score = 1000;
  state.currentLevel = 0;
  state.conversationQueue = [];
  state.currentBuilding = -1;
  state.isPaused = false;
}

export const resetLevelState = () => {
  state.level = { ...defaultLevel };
};

export const SLOW_MO_MODIFIER = 0.045;
export const speedModifier = () => state.level.isSlowMo ? SLOW_MO_MODIFIER : 1;

export default state;
