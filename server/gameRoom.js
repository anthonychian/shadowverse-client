const {
  createInitialGameState,
  loadDecks,
  applyAction,
  createPlayerView,
  resetIdCounter,
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
    let state = createInitialGameState(0);
    state = loadDecks(state, decks);
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
    return {
      0: createPlayerView(this.state, 0),
      1: createPlayerView(this.state, 1),
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
