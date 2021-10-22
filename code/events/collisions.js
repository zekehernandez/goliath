import state from '../state';
import { COLORS } from '../game.constants';

export const registerCollisions = ({ checkEnd }) => {
  const attemptAmmoRecover = (blade) => {
    if (!blade.isRecovered) {
      state.level.ammoRecovered++;
      blade.isRecovered = true;
    }
  }

  collides("mover", "land", (mover) => {
      mover.unuse("mover");
      mover.sideSpeed = 0;
      mover.upSpeed = 0;
      shake(10);
  });

  collides("player", "land", (player, land) => {
    if (player.state !== "landed") {
      player.state = "landed";
      player.isKicking = false;
      player.isThrowing = false;
      state.level.isSlowMo = false;
      destroyAll("throwArrow");
      checkEnd();
    }
  });

  collides("blade", "enemy", (blade, enemy) => {
    const wasPreviouslyDisabled = enemy.disabled;
    blade.speed = 0;
    enemy.disabled = true;
    enemy.color = COLORS.GREY;
    attemptAmmoRecover(blade);
    shake(5);
    if (!wasPreviouslyDisabled) {
      checkEnd();
    }
  });

  collides("blade", "flier", (blade, flier) => {
    flier.use("mover");
    blade.use(follow(flier, blade.pos.sub(flier.pos)));
    attemptAmmoRecover(blade);
    const direction = dir(blade.throwAngle).scale(4)
    flier.sideSpeed = direction.x;
    flier.upSpeed = -direction.y;
  });

  collides("blade", "land", (blade) => {
    blade.speed = 0;
    attemptAmmoRecover(blade);
    state.level.misses++;
    checkEnd();
  });

  collides("player", "flier", (player, flier) => {
    if (!flier.disabled) {
      shake(10);
      player.sideSpeed = 0;
    }
  });

  collides("player", "kickable", (player, kickable) => {
    if (kickable.disabled === false) {
      player.isKicking = true;
      state.level.isSlowMo = true;
      kickable.disabled = true;
      kickable.color = COLORS.GREY;
      shake(10);
      wait(1, () => {
        kickable.kickDirection = player.pos.sub(kickable.pos).x;
        state.level.isSlowMo = false;
        player.isKicking = false;
      })
    }
  });
}
