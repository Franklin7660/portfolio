import kaplay from "kaplay";
import { PALETTE } from "./constants";

export default function makeKaplayCtx() {
    return kaplay({
        global: false,
        pixelDensity: 2,
        touchToMouse: true,
        debug: false,
        canvas: document.getElementById("game"),
        background: PALETTE.color1,
    })
}