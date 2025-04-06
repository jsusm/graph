import { useRef } from "react"
import { draw } from "./lib/draw.ts"
import { useResizeCanvas } from "./hooks/useResizeCanvas.ts"
import { useCanvasLoop } from "./hooks/useCanvasLoop.ts"
import { Button } from "./components/ui/Button.tsx"
import { cn } from "./lib/classMerge.ts"
import { useCursorTool } from "./hooks/tools/useCursorTool.ts"
import { useSimpleShapeTool } from "./hooks/tools/useSimpleShapeTool.ts"
import { usePencilTool } from "./hooks/tools/usePencilTool.ts"
import { useCanvasDrawEvents } from "./hooks/useCanvasDrawEvents.ts"
import { useCanvasContext } from "./hooks/useCanvasContext.ts"
import { useDrawingCanvasState } from "./hooks/useDrawingCanvasState.ts"

function App() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const { context: ctx } = useCanvasContext(canvas)

  const { refState, state, dispatch } = useDrawingCanvasState(ctx)

  useCanvasLoop(ctx, refState, draw)
  useResizeCanvas(canvas)

  const cursorTool = useCursorTool({ refAppState: refState, dispatch, canvasContext: ctx })
  const rectTool = useSimpleShapeTool({ refAppState: refState, dispatch, canvasContext: ctx }, 'rect')
  const elipceTool = useSimpleShapeTool({ refAppState: refState, dispatch, canvasContext: ctx }, 'elipce')
  const lineTool = useSimpleShapeTool({ refAppState: refState, dispatch, canvasContext: ctx }, 'line')
  const pencilTool = usePencilTool({ refAppState: refState, dispatch, canvasContext: ctx })

  const { registerTool } = useCanvasDrawEvents(state)

  registerTool(cursorTool.handlers, 'cursor')
  registerTool(rectTool.handlers, 'rect')
  registerTool(elipceTool.handlers, 'elipce')
  registerTool(lineTool.handlers, 'line')
  registerTool(pencilTool.handlers, 'pencil')

  const dragging = cursorTool.state == 'dragging' || rectTool.state == "drawing" || elipceTool.state == 'drawing' || lineTool.state == 'drawing' || pencilTool.state == 'drawing'

  return (
    <main className={cn("bg-stone-900 min-h-screen text-white relative", { 'cursor-grab': state.tool == "cursor" && cursorTool.hover })}>
      <canvas ref={canvas}>
      </canvas>

      <div className={cn("absolute top-8 left-1/2 -translate-x-1/2 px-4 py-3 border border-stone-600 rounded-lg bg-stone-900", dragging && 'pointer-events-none')}>
        <div className="flex gap-3">
          <Button className={cn(state.tool === 'cursor' && 'text-amber-600')} onClick={() => dispatch({ type: 'tool', payload: { tool: 'cursor' } })}>
            [cursor]
          </Button>
          <Button className={cn(state.tool === 'rect' && 'text-amber-600')} onClick={() => dispatch({ type: 'tool', payload: { tool: 'rect' } })}>
            [rect]
          </Button>
          <Button className={cn(state.tool === 'elipce' && 'text-amber-600')} onClick={() => dispatch({ type: 'tool', payload: { tool: 'elipce' } })}>
            [elipce]
          </Button>
          <Button className={cn(state.tool === 'line' && 'text-amber-600')} onClick={() => dispatch({ type: 'tool', payload: { tool: 'line' } })}>
            [line]
          </Button>
          <Button className={cn(state.tool === 'pencil' && 'text-amber-600')} onClick={() => dispatch({ type: 'tool', payload: { tool: 'pencil' } })}>
            [pencil]
          </Button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 pointer-events-none">
        <pre>
          tool: {state.tool} <br />
          stateSaved: {state.saved ? 'true' : 'false'} <br />
          node count: {state.nodes.length} <br />
          cursor.hover: {cursorTool.hover ? 'true' : 'false'} <br />
          cursor.state: {cursorTool.state}
        </pre>
      </div>
    </main>
  )
}

export default App
