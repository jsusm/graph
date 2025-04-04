import { RefObject, useEffect, useReducer, useRef } from "react"
import { appStateReducer } from "../reducers/appState"
import { loadState } from "../persistance/loadState"

export function useDrawingCanvasState(ctx: RefObject<CanvasRenderingContext2D | null>) {
  const [state, dispatch] = useReducer(appStateReducer, loadState())
  const refState = useRef(state)

  // save state when tool changes
  useEffect(() => {
    localStorage.setItem('nodes', JSON.stringify(state.nodes))
    localStorage.setItem('lastId', JSON.stringify(state.lastId))
  }, [state.saved])

  // sync state
  useEffect(() => {
    refState.current = state
  }, [state])

  // Use tools

  return { state, refState, dispatch }
}
