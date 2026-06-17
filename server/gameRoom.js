const {
  createInitialGameState,
  loadDecks,
  applyAction,
  createPlayerView,
  resetIdCounter,
  detectDeckIdentity,
} = require("sve-engine");

class GameRoom {
  constructor(roomId, automated = false) {
    this.roomId = roomId;
    this.automated = automated;
    this.players = new Map();
    this.state = null;
    this.seq = 0;
    this.legacySnapshots = {};
  }

  addPlayer(socketId, playerId) {
    if (playerId) {
      for (const [existingSocket, info] of this.players.entries()) {
        if (info.playerId === playerId) {
          this.players.delete(existingSocket);
          this.players.set(socketId, info);
          return info.slot;
        }
      }
    }
    const slot = this.players.size;
    if (slot >= 2) return null;
    this.players.set(socketId, { playerId, slot });
    return slot;
  }

  getSlot(socketId) {
    return this.players.get(socketId)?.slot;
  }

  startAutomatedGame(decks) {
    resetIdCounter();
    const preparedDecks = decks.map((deck) => {
      const identity = detectDeckIdentity([
        ...(deck.mainDeck || []),
        ...(deck.evolveDeck || []),
      ]);
      return {
        ...deck,
        universe: deck.universe ?? identity.universe ?? undefined,
      };
    });
    this.deckIdentities = preparedDecks.map((deck) =>
      detectDeckIdentity([...(deck.mainDeck || []), ...(deck.evolveDeck || [])]),
    );
    let state = createInitialGameState(0);
    state = loadDecks(state, preparedDecks);
    this.state = state;
    this.seq += 1;
    return this.broadcastViews();
  }

  applyPlayerAction(socketId, action) {
    const slot = this.getSlot(socketId);
    if (slot == null || !this.state) {
      return { ok: false, error: "Not in game" };
    }
    const result = applyAction(this.state, slot, action);
    if (!result.ok) {
      return { ok: false, error: result.error, actionId: action.actionId };
    }
    this.state = result.state;
    this.seq += 1;
    return { ok: true, views: this.broadcastViews(), seq: this.seq };
  }

  broadcastViews() {
    if (!this.state) return null;
    const viewFor = (slot) => {
      const view = createPlayerView(this.state, slot);
      const opponent = slot === 0 ? 1 : 0;
      if (this.deckIdentities?.[slot]) {
        view.selfLeader = this.deckIdentities[slot].leader;
      }
      if (this.deckIdentities?.[opponent]) {
        view.opponentLeader = this.deckIdentities[opponent].leader;
      }
      return view;
    };
    return {
      0: viewFor(0),
      1: viewFor(1),
      seq: this.seq,
      phase: this.state.phase,
      winner: this.state.winner,
    };
  }

  getViewFor(socketId) {
    const slot = this.getSlot(socketId);
    if (slot == null || !this.state) return null;
    const views = this.broadcastViews();
    return views[slot];
  }

  storeLegacySnapshot(playerId, snapshot) {
    this.legacySnapshots[playerId] = snapshot;
  }

  getLegacySnapshot(playerId) {
    return this.legacySnapshots[playerId];
  }
}

module.exports = { GameRoom };
