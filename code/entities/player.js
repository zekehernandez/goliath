import k from "../kaboom";
import { moverProps } from './';
import state from '../state';
import { UNITS } from '../constants';
import { COLORS, getColliderComps } from '../utils';
import { START_JUMP_END_FRAME, LANDING_END_FRAME, FALLING_END_FRAME } from '../loadAssets';

const playerComps = [
  "player",
    sprite("player"),
    z(5),
    area(),
    rotate(),
    origin("center"),
    {
      ...moverProps,
      state: 'prelaunch',
      isKicking: false,
      isThrowing: false,
      isFalling: false,
    },
];


export const createPlayer = (otherProps = []) => {
  return [...playerComps, ...otherProps];
};

export const destroyPlayer = () => {
  destroyAll("player");
  destroyAll("playerLandCollider");
};

export const addPlayerColliders = () => {
  const player = get("player")[0];
  add([
    "playerLandCollider",
    "landCollider",
    layer('ui'),
    rect(0.5*UNITS, 0.5*UNITS),
    ...getColliderComps(COLORS.PURPLE),
    pos(-2*UNITS, -2*UNITS),
    origin("bot"),
    follow(player, vec2(0, 1*UNITS)),
    area(),
    {
      owner: player,
    }
  ])
};

export const registerPlayerActions = ({ attemptReset }) => {
  // player movement
  action("player", player => {
    console.log(`state: ${player.state}, isThrowing: ${player.isThrowing}, isRecovering: ${state.level.isRecovering}`);

    if (player.pos.x > width() + 2*UNITS || player.pos.y > height() + 2*UNITS) {
      attemptReset();
    }

    // I have to manage the animation transitions like this because onEnd()
    const curAnim = player.curAnim();
    if (player.isKicking) {
      player.angle = 0;
      player.play("kicking", { loop: true })
    } else if (state.level.isRecovering) {
      player.play("landing")
    } else if (player.state === "prelaunch" && curAnim !== "idle") {
      player.play("idle", { loop: true, speed: 4 });
    } else if (player.state === "launching" && curAnim !== "crouch") {
      player.play("crouch", { loop: true, speed: 4 });
    } else if (player.state === "launched" || player.state === "afterThrow") {
      if (player.isThrowing) {
        if (curAnim !== "throwing") {
          // player.play("throwing");
          player.frame = 36;
        }

        const throwArrow = get("throwArrow")[0];
        player.angle = throwArrow.angle;
      } else {
        if (curAnim === "crouch") {
          player.play("startJump", { speed: 10 });
        } else if (curAnim !== "somersault" && (curAnim !== "startJump" || player.frame >= START_JUMP_END_FRAME)) {
          player.frame = 32;
          player.flipX(false);
          player.angle += 20;
        } 
      }
    } else if (player.state === "landed" && player.frame !== LANDING_END_FRAME) {
      if (!curAnim || curAnim === "somersault" || curAnim === "throwing" || curAnim === "kicking") {
        player.play("landing", { speed: 2 });
        player.flipX(false);
        player.angle = 0;
      }
    } else if (curAnim !== "idle" && (get("target").length === 0 || state.level.isWon === true)) {
      player.play("idle", { loop: true, speed: 4});
    }
  });
}
