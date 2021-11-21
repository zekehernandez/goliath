 import state, { SCORES } from '../state';
import { COLORS, flash, shakeEntity, addScore } from '../utils';

export const registerCollisions = ({ endThrow, checkEnd }) => {
  collides("landCollider", "land", (collider) => {
      collider.owner.unuse("mover");
      collider.owner.sideSpeed = 0;
      collider.owner.upSpeed = 0;
      play("land");
      shake(10);
  });

  collides("playerLandCollider", "land", () => {
    const player = get("player")[0];
    if (player.state !== "landed" && !player.isFalling) {
      player.state = "landed";
      player.isKicking = false;
      endThrow(player);
      checkEnd();
    }
  });

  collides("playerLandCollider", "wallCollider", () => {
    const player = get("player")[0];
    if (player.state !== "landed") {
      player.sideSpeed = 0;
      player.isFalling = true;
    }
  });

  collides("blade", "enemyHurtbox", (blade, enemyHurtbox) => {
    const enemy = enemyHurtbox.owner;
    const wasPreviouslyDisabled = enemy.disabled;
    blade.speed = 0;
    enemy.disabled = true;
    addScore(SCORES.KUNAI_HIT);
    enemy.play("disabled", { loop: true });
    play("hit");
    enemy.eye && enemy.eye.play("disabled");
    enemy.thruster && enemy.thruster.destroy();
    shake(5);
    if (!wasPreviouslyDisabled) {
      if (enemy.is("flier")) {
        play("disabledFlier");
      } else {
        play("disabledTallbot")
      }
      checkEnd();
    }
  });

  collides("blade", "flierHurtbox", (blade, flierHurtbox) => {
    const flier = flierHurtbox.owner;
    flier.use("mover");
    blade.use(follow(flier, blade.pos.sub(flier.pos)));
    const direction = dir(blade.throwAngle).scale(4)
    flier.sideSpeed = direction.x;
    flier.upSpeed = -direction.y;
  });

  collides("blade", "land", (blade) => {
    if (blade.speed !== 0) {
      addScore(SCORES.MISS);
      blade.speed = 0;
    }
    checkEnd();
  });

  collides("player", "flierHurtbox", (player, flierHurtbox) => {
    const flier = flierHurtbox.owner;
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
      addScore(SCORES.KICK);
      kickable.color = COLORS.GREY;
      const kickDirection = player.pos.sub(kickable.pos).x;
      if (kickable.curAnim() !== "kicked" && kickDirection < 0) {
        kickable.play("kicked", { loop: true })
      } else {
        kickable.play("disabled");
      }
      play("kick");
      wait(0.5, () => { play("kicked" )})
      shake(10);
      wait(1, () => {
        kickable.kickDirection = kickDirection;
        state.level.isSlowMo = false;
        player.isKicking = false;
      })
    }
  });
}
