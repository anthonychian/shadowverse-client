// Drag-to-field support. Lets a hand card (hand/Card.js) discover which of the
// 10 field zones it was dropped on, and lets the field draw drop hints while a
// drag is in progress. It's a tiny shared module because the draggable card and
// the field overlay live in sibling component subtrees.

// The player's field grid container (10 zones: 5 front row + 5 EX area, laid out
// 5 columns x 2 rows, row-major). Registered by Field via a ref callback.
let fieldGridEl = null;
export const registerFieldGrid = (el) => {
  fieldGridEl = el || null;
};
export const getFieldGridRect = () =>
  fieldGridEl ? fieldGridEl.getBoundingClientRect() : null;

// Map viewport coordinates to a field index 0..9 (0-4 = front row, 5-9 = EX
// area), or -1 when outside the grid. Even 5x2 division — the small column gaps
// are folded into the cells, which is plenty accurate for dropping. Uses
// viewport coords so it's correct regardless of the board's CSS scale.
export const fieldIndexAt = (x, y) => {
  const r = getFieldGridRect();
  if (!r || x < r.left || x > r.right || y < r.top || y > r.bottom) return -1;
  const col = Math.min(4, Math.floor(((x - r.left) / r.width) * 5));
  const row = (y - r.top) / r.height < 0.5 ? 0 : 1;
  return row * 5 + col;
};

// The opponent's field grid (as shown on this screen), registered by Field.
// Used to fly the "card played" reveal onto the exact slot when the opponent
// plays a card.
let enemyFieldGridEl = null;
export const registerEnemyFieldGrid = (el) => {
  enemyFieldGridEl = el || null;
};
export const getEnemyFieldGridRect = () =>
  enemyFieldGridEl ? enemyFieldGridEl.getBoundingClientRect() : null;

// Viewport centre of grid cell `cell` (0..9, row-major 5x2) within a grid rect.
const slotCenter = (rect, cell) => {
  if (!rect) return null;
  const col = cell % 5;
  const row = cell < 5 ? 0 : 1;
  return {
    x: rect.left + (col + 0.5) * (rect.width / 5),
    y: rect.top + (row + 0.5) * (rect.height / 2),
  };
};
export const fieldSlotCenter = (cell) => slotCenter(getFieldGridRect(), cell);
export const enemyFieldSlotCenter = (cell) =>
  slotCenter(getEnemyFieldGridRect(), cell);

// The player's cemetery pile, registered by Cemetery via a ref callback. A
// second drop target for hand cards (discard).
let cemeteryEl = null;
export const registerCemetery = (el) => {
  cemeteryEl = el || null;
};
export const getCemeteryRect = () =>
  cemeteryEl ? cemeteryEl.getBoundingClientRect() : null;
export const isOverCemetery = (x, y) => {
  const r = getCemeteryRect();
  return !!r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
};

// The player's hand row, registered by Hand via a ref callback. A drop target
// for returning a field card to hand.
let handEl = null;
export const registerHand = (el) => {
  handEl = el || null;
};
export const getHandRect = () => (handEl ? handEl.getBoundingClientRect() : null);
export const isOverHand = (x, y) => {
  const r = getHandRect();
  return !!r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
};

// Hover bus: the dragged card publishes its live state ({ active, index,
// cemetery, hand, showCemetery, showHand }); the drop-hint overlay subscribes.
const hoverListeners = new Set();
export const onDragHover = (cb) => {
  hoverListeners.add(cb);
  return () => hoverListeners.delete(cb);
};
export const setDragHover = (state) => {
  hoverListeners.forEach((cb) => cb(state));
};
