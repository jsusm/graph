import { useEffect, useRef } from "react"
import { DrawState, Tool } from "../lib/types"

export function useCanvasDrawEvents(state: DrawState) {
  // Manage handlers
  const handlersToRemove = useRef<() => void>(() => { })
  const toolsHandlers: { [key: string]: () => () => void } = {}

  function registerTool(toolHandler: () => () => void, key: Tool) {
    toolsHandlers[key] = toolHandler
  }

  // remove event listeners and register new ones
  useEffect(() => {
    handlersToRemove.current()
    if (toolsHandlers[state.tool] == undefined) {
      console.error("The tool:", state.tool, "is not registered")
      return
    }
    handlersToRemove.current = toolsHandlers[state.tool]()

  }, [state])

  return { registerTool }
}
