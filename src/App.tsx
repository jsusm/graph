import { useEffect, useReducer, useRef } from "react"
import { DrawNode } from "./lib/types.ts"
import { draw } from "./lib/draw.ts"
import { useResizeCanvas } from "./hooks/useResizeCanvas.ts"
import { useCanvasLoop } from "./hooks/useCanvasLoop.ts"
import { Button } from "./components/ui/Button.tsx"
import { cn } from "./lib/classMerge.ts"
import { useCursorTool } from "./hooks/tools/useCursorTool.ts"
import { appStateReducer } from "./reducers/appState.ts"
import { useRectTool } from "./hooks/tools/useRectTool.ts"

function App() {
  const canvas = useRef<HTMLCanvasElement>(null)

  const initialNodes: DrawNode[] = [
    {
      id: 1,
      type: 'square',
      bounding: [40, 40, 80, 80],
      strokeColor: 'red',
      path: new Path2D(),
      lineWidth: 2,
      filled: true,
      fillColor: 'red',
    },
    {
      id: 2,
      type: 'square',
      bounding: [40, 40, 80, 80],
      strokeColor: 'blue',
      path: new Path2D(),
      lineWidth: 3,
      filled: false,
      fillColor: 'blue',
    }
  ]

  const [state, dispatch] = useReducer(appStateReducer, { nodes: initialNodes, tool: 'cursor', selectedNodeId: -1, selectedNodeIdx: -1, lastId: 4 })
  const refState = useRef(state)

  const { context: ctx } = useCanvasLoop(canvas, refState, draw)
  useResizeCanvas(canvas)

  // Use tools
  const cursorTool = useCursorTool({ refAppState: refState, dispatch, canvasContext: ctx })
  const rectTool = useRectTool({ refAppState: refState, dispatch, canvasContext: ctx })

  // Manage handlers
  const handlersToRemove = useRef<() => void>(() => { })
  const toolsHandlers: { [key: string]: () => () => void } = {}

  // register tools event listeners
  toolsHandlers['cursor'] = cursorTool.handlers
  toolsHandlers['rect'] = rectTool.handlers

  // remove event listeners and register new ones
  useEffect(() => {
    handlersToRemove.current()
    handlersToRemove.current = toolsHandlers[refState.current.tool]()

    refState.current = state
  }, [state])

  return (
    <main className={cn("bg-stone-900 min-h-screen text-white", { 'cursor-grab': state.tool == "cursor" && cursorTool.hover })}>
      <canvas ref={canvas}>
      </canvas>

      <div className="absolute top-8 left-1/2 -translate-x-1/2 px-4 py-3 border border-stone-600 rounded-lg">
        <div className="flex gap-3">
          <Button className={cn(state.tool === 'cursor' && 'text-amber-600')} onClick={() => dispatch({ type: 'tool', payload: { tool: 'cursor' } })}>
            [cursor]
          </Button>
          <Button className={cn(state.tool === 'rect' && 'text-amber-600')} onClick={() => dispatch({ type: 'tool', payload: { tool: 'rect' } })}>
            [rect]
          </Button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 pointer-events-none">
        <pre>
          tool: {state.tool} <br />
          cursor.hover: {cursorTool.hover ? 'true' : 'false'} <br />
          cursor.state: {cursorTool.state}
        </pre>
      </div>
    </main>
  )
}

export default App
