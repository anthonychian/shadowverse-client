// Local dice-roll pub/sub. The dice button (ShowDice) publishes a roll and the
// DiceRoll overlay plays the toss for the local player. The opponent's roll is
// delivered separately over the existing synced `dice` socket message (Redux
// enemyDice), which DiceRoll also watches — so both players see the same throw
// and the same result.
const listeners = new Set();
let nextId = 0;

export const onDiceRoll = (cb) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

export const playDiceRoll = (value) => {
  const evt = { id: ++nextId, value };
  listeners.forEach((cb) => cb(evt));
};
