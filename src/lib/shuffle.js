/**
 * Fisher–Yates shuffle. Returns a new array; does not mutate the input.
 * Prefer this over Array.sort(() => Math.random() - 0.5), which is biased
 * and tends to leave nearby decklist copies clustered.
 */
export function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }