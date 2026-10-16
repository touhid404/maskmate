import { useReducer } from "react";
import type { HistoryState, HistoryAction } from "../types/editor";
export const initialHistory: HistoryState = {
  regions: [],
  past: [],
  future: [],
};
export function historyReducer(
  state: HistoryState,
  action: HistoryAction,
): HistoryState {
  switch (action.type) {
    case "commit":
      return {
        regions: action.regions,
        past: [...state.past.slice(-49), state.regions],
        future: [],
      };
    case "undo":
      return state.past.length
        ? {
            regions: state.past.at(-1)!,
            past: state.past.slice(0, -1),
            future: [state.regions, ...state.future],
          }
        : state;
    case "redo":
      return state.future.length
        ? {
            regions: state.future[0],
            past: [...state.past, state.regions],
            future: state.future.slice(1),
          }
        : state;
    case "clear":
      return initialHistory;
  }
}
export function useHistory() {
  return useReducer(historyReducer, initialHistory);
}
