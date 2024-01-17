// store.js
import { create } from 'zustand';

const useStore = create(set => ({
  debugMode: false,
  setDebugMode: (debug) => set({ debugMode: debug }),
  startPressed: false,
  setStartPressed: (pressed) => set({ startPressed: pressed }),
  introDone: false,
  setIntroDone: (done) => set({ introDone: done }),
  robotAnimation: 'hello',
  setRobotAnimation: (animation) => set({ robotAnimation: animation }),
  usersTurn: true,
  setUsersTurn: (turn) => set({ usersTurn: turn }),
  winner: false,
  setWinner: (winner) => set({ winner: winner }),
  restartGame: false,
  setRestartGame: (restart) => set({ restartGame: restart }),
  muted: false,
  setMuted: (muted) => set({ muted: muted }),
}));

export default useStore;