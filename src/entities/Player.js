import { DIAGONAL_FACTOR } from "../constants.js";
import { store, isSocialModalVisibleAtom, isEmailModalVisibleAtom, isProjectModalVisibleAtom } from "../store";

export default function makePlayer(k, posVec2, speed) {
    const player = k.add([
        k.sprite("player", { anim: "walk-down" }),
        k.scale(8),
        k.anchor("center"),
        k.area({ shape: new k.Rect(k.vec2(0), 5, 10) }),
        k.body(),
        k.pos(posVec2),
        "player",
        {
            direction: k.vec2(0, 0),
            directionName: "walk-down",
            isMoving: false
        },
    ]);

    let isMouseDown = false;
    const game = document.getElementById("game");
    game.addEventListener("focusout", () => {
        isMouseDown = false;
    });
    game.addEventListener("mousedown", () => {
        isMouseDown = true;
    });

    game.addEventListener("mouseup", () => {
        isMouseDown = false;
    });

    game.addEventListener("touchstart", () => {
        isMouseDown = true;
    });

    game.addEventListener("touchend", () => {
        isMouseDown = false;
    });

    player.onUpdate(() => {
        if (!k.camPos().eq(player.pos)) {
            k.tween(
                k.camPos(),
                player.pos,
                0.2,
                (newPos) => k.camPos(newPos),
                k.easings.linear
            );
        }

        if (
            store.get(isSocialModalVisibleAtom) ||
            store.get(isEmailModalVisibleAtom) ||
            store.get(isProjectModalVisibleAtom)
        )
            return;

        player.direction = k.vec2(0, 0);
        const worldMousePos = k.toWorld(k.mousePos());

        // hysteresis thresholds to avoid flicker when the mouse is near the player
        const MOVE_START = 12; // px to start moving
        const MOVE_STOP = 8; // px to stop moving (hysteresis)
        const SNAP_THRESHOLD = 0.05;

        const desired = worldMousePos.sub(player.pos);
        const desiredLen = desired.len();

        if (isMouseDown) {
            if (desiredLen > MOVE_START) {
                player.isMoving = true;
                player.direction = desired.unit();
            } else if (desiredLen < MOVE_STOP) {
                player.isMoving = false;
                player.direction = k.vec2(0, 0);
            } else if (player.isMoving) {
                // in-between hysteresis region, keep moving if we were moving
                player.direction = desired.unit();
            } else {
                player.direction = k.vec2(0, 0);
            }

            // snap tiny components to avoid floating-point jitter
            if (player.direction.x && Math.abs(player.direction.x) < SNAP_THRESHOLD) player.direction.x = 0;
            if (player.direction.y && Math.abs(player.direction.y) < SNAP_THRESHOLD) player.direction.y = 0;
        } else {
            player.isMoving = false;
            player.direction = k.vec2(0, 0);
        }

        // if we are not moving, play the idle animation and bail out
        if (!player.isMoving) {
            if (!player.getCurAnim().name.includes("idle")) {
                player.play(`${player.directionName}-idle`);
            }
            return;
        }

        // pick dominant axis so we don't flip rapidly between up/down/left/right
        if (Math.abs(player.direction.x) > Math.abs(player.direction.y)) {
            player.directionName = player.direction.x > 0 ? "walk-right" : "walk-left";
        } else {
            player.directionName = player.direction.y > 0 ? "walk-down" : "walk-up";
        }

        if (player.getCurAnim().name !== player.directionName) {
            player.play(player.directionName);
        }

        // movement
        if (player.direction.x && player.direction.y) {
            player.move(player.direction.scale(DIAGONAL_FACTOR * speed));
            return;
        }

        player.move(player.direction.scale(speed));
    });

    return player;
}