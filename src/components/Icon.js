import { PALETTE } from "../constants";

export default function makeIcon(k, parent, posVec2, imageData, subtitle) {
  const icon = parent.add([
    k.sprite(imageData.name, {
      width: imageData.width,
      height: imageData.height,
    }),
    k.anchor("center"),
    k.pos(posVec2),
    k.opacity(0),
    k.offscreen({ hide: true, distance: 300 }),
  ]);

  const subtitleText = icon.add([
    k.text(subtitle, { font: "ibm-bold", size: 32 }),
    // Use the light palette color so the text doesn't blend into the dark section background
    k.color(k.Color.fromHex(PALETTE.color2)),
    k.anchor("center"),
    k.pos(0, 100),
    k.opacity(0),
  ]);

  return [icon, subtitleText];
}
