import { PALETTE } from "../constants";
import {
  isProjectModalVisibleAtom,
  chosenProjectDataAtom,
  store,
} from "../store";
import { opacityTrickleDown } from "../utils";

export default function makeProjectCard(k, parent, posVec2, data, thumbnail) {
  const card = parent.add([
    k.rect(700, 345, { radius: 12 }),
    k.color(PALETTE.color2),
    k.outline(4, k.Color.fromHex(PALETTE.color1)),
    k.anchor("center"),
    k.pos(posVec2),
    k.opacity(0),
    k.offscreen({ hide: true, distance: 300 }),
  ]);

  const cardMask = card.add([
    k.rect(320, 320, { radius: 10 }),
    k.anchor("center"),
    k.pos(180, 0),
    k.mask("intersect"),
    k.opacity(0),
  ]);

  const image = cardMask.add([
    k.sprite(thumbnail, { width: 300, height: 300 }),
    k.anchor("center"),
    k.opacity(0),
  ]);

  const cardTitle = card.add([
    k.text(data.title, {
      font: "ibm-bold",
      size: 32,
      width: 280,
      lineSpacing: 8,
    }),
    k.color(k.Color.fromHex(PALETTE.color1)),
    k.pos(-320, -140),
    k.opacity(0),
  ]);

  const cardSwitch = card.add([
    k.circle(30),
    k.area(),
    k.color(k.Color.fromHex(PALETTE.color2)),
    k.pos(-450, 0),
    k.opacity(0),
  ]);

  cardSwitch.onCollide("player", () => {
    store.set(isProjectModalVisibleAtom, true);
    store.set(chosenProjectDataAtom, data);
  });

  opacityTrickleDown(parent, [
    cardMask,
    image,
    cardTitle,
    cardSwitch,
  ]);

  return card;
}
