import { ActionDispatch, Dispatch, RefObject, useEffect, useMemo, useReducer, useRef, useState } from "react"
import { strokeColors, fillColors, Colors } from './lib/colors.ts'
import { DrawNode, DrawState, Tool } from "./lib/types.ts"
import { draw } from "./lib/draw.ts"
import { useResizeCanvas } from "./hooks/useResizeCanvas.ts"
import { useCanvasLoop } from "./hooks/useCanvasLoop.ts"
import { Button } from "./components/ui/Button.tsx"
import { cn } from "./lib/classMerge.ts"

type Action =
  { type: 'tool'; payload: { tool: Tool } } |
  { type: 'selectNode'; payload: { nodeId: number } } |
  { type: 'setNode', payload: { id: number, nodeData: DrawNode } } |
  { type: 'addNode', payload: { nodeData: DrawNode } } |
  { type: 'removeNode', payload: { id: number } }

function reducer(prevState: DrawState, action: Action): DrawState {
  switch (action.type) {
    case 'tool':
      prevState.tool = action.payload.tool
      return { ...prevState, tool: action.payload.tool };

    case 'selectNode':
      return { ...prevState, selectedNodeId: action.payload.nodeId, selectedNodeIdx: prevState.nodes.findIndex(n => n.id == action.payload.nodeId) }

    case 'setNode':
      return { ...prevState, nodes: prevState.nodes.map(n => n.id == action.payload.id ? action.payload.nodeData : n) }

    case 'addNode':
      return { ...prevState, nodes: [...prevState.nodes, action.payload.nodeData] }

    case 'removeNode':
      return { ...prevState, nodes: prevState.nodes.filter(n => n.id != action.payload.id) }

    default:
      return prevState;
  }
}

function useCursorTool(context: { refAppState: RefObject<DrawState>, dispatch: ActionDispatch<[action: Action]>, canvasContext: RefObject<CanvasRenderingContext2D | null> }) {
  const [hover, setHover] = useState(false)
  const [state, setState] = useState('idle')
  const [relativeOffset, setRelativeOffset] = useState<[number, number]>([0, 0])

  const toolStateRef = useRef({ hover, state })

  useEffect(() => {
    toolStateRef.current = { hover, state }
  }, [hover, state])

  const handlers = () => {
    const pointermove = (e: MouseEvent) => {
      const rs = context.refAppState.current
      const cc = context.canvasContext.current
      if (!cc) {
        return
      }
      // check if the mouse is over a node
      let isHover = false
      for (let i = rs.nodes.length - 1; i >= 0; i--) {
        const obj = rs.nodes[i];
        if (cc) {
          cc.lineWidth = 10
        }
        if (cc.isPointInStroke(obj.path, e.clientX, e.clientY) || (obj.filled && cc.isPointInPath(obj.path, e.clientX, e.clientY))) {
          isHover = true;
          break
        }
      }
      setHover(isHover)

      if (toolStateRef.current.state == 'dragging') {
        const node = { ...rs.nodes[rs.selectedNodeIdx] }
        node.bounding = [
          relativeOffset[0] + e.clientX,
          relativeOffset[1] + e.clientY,
          node.bounding[2],
          node.bounding[3]
        ]
        context.dispatch({ type: 'setNode', payload: { id: node.id, nodeData: node } })
      }
    }

    const pointerdown = (e: MouseEvent) => {
      const rs = context.refAppState.current
      const cc = context.canvasContext.current
      if (!cc) {
        return
      }
      for (let i = rs.nodes.length - 1; i >= 0; i--) {
        const node = rs.nodes[i];
        if (cc) {
          cc.lineWidth = 10
        }
        if (cc.isPointInStroke(node.path, e.clientX, e.clientY) || (node.filled && cc.isPointInPath(node.path, e.clientX, e.clientY))) {
          context.dispatch({ type: 'selectNode', payload: { nodeId: node.id } })
          setRelativeOffset([node.bounding[0] - e.clientX, node.bounding[1] - e.clientY])
          break
        }
      }

      if (toolStateRef.current.hover) {
        setState('dragging')
      }
    }
    const pointerup = (e: MouseEvent) => {
      if (toolStateRef.current.state == 'dragging') {
        setState('idle')
      }
    }
    window.addEventListener('pointermove', pointermove)
    window.addEventListener('pointerdown', pointerdown)
    window.addEventListener('pointerup', pointerup)

    return () => {
      window.removeEventListener('pointermove', pointermove)
      window.removeEventListener('pointerdown', pointerdown)
      window.removeEventListener('pointerup', pointerup)
    }
  }

  return {
    hover,
    state,
    handlers,
  }
}

function useRectTool(context: { refAppState: RefObject<DrawState>, dispatch: ActionDispatch<[action: Action]>, canvasContext: RefObject<CanvasRenderingContext2D | null> }) {
  const [state, setState] = useState('idle')

  const toolStateRef = useRef({ state })

  useEffect(() => {
    toolStateRef.current = { state }
  }, [state])

  const handlers = () => {
    const pointermove = (e: MouseEvent) => { }
    const pointerdown = (e: MouseEvent) => { console.log("click from rect tool") }
    const pointerup = (e: MouseEvent) => { }

    window.addEventListener('pointermove', pointermove)
    window.addEventListener('pointerdown', pointerdown)
    window.addEventListener('pointerup', pointerup)

    return () => {
      window.removeEventListener('pointermove', pointermove)
      window.removeEventListener('pointerdown', pointerdown)
      window.removeEventListener('pointerup', pointerup)
    }
  }

  return {
    state,
    handlers,
  }
}


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

  const [state, dispatch] = useReducer(reducer, { nodes: initialNodes, tool: 'cursor', selectedNodeId: -1, selectedNodeIdx: -1 })
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

  // const setupListeners = () => {
  //   window.addEventListener('mousemove', (e) => {
  //   })

  //   canvas.current?.addEventListener('pointerdown', e => {
  //     setDrawState(ds => ({ ...ds, mouse: { ...ds.mouse, pressedMousePosition: [e.clientX, e.clientY] } }))

  //     const ds = refDrawState.current
  //     if (!ds.hover) {
  //       setDrawState(s => ({
  //         ...s,
  //         actionState: 'idle'
  //       }))
  //     }

  //     for (let i = ds.objects.length - 1; i >= 0; i--) {
  //       const obj = ds.objects[i];
  //       if (ctx.current) {
  //         ctx.current.lineWidth = 10
  //       }
  //       if (ctx.current?.isPointInStroke(obj.path, e.clientX, e.clientY) || (obj.filled && ctx.current?.isPointInPath(obj.path, e.clientX, e.clientY))) {
  //         setDrawState(s => ({
  //           ...s,
  //           selectedNode: i,
  //           actionState: 'dragging',
  //           mouse: {
  //             relativeOffset: [obj.bounding[0] - e.clientX, obj.bounding[1] - e.clientY]
  //           }
  //         }))
  //         break
  //       }
  //     }
  //   })
  //   canvas.current?.addEventListener('pointerup', e => {
  //     const ds = refDrawState.current
  //     if (ds.actionState == 'dragging') {
  //       setDrawState(s => ({ ...s, actionState: 'selecting' }))
  //     }
  //   })
  // }

  // function onSelectColor(c: Colors) {
  //   if (drawState.actionState == 'selecting') {
  //     const objects = [...drawState.objects]
  //     objects[drawState.selectedNode].fillColor = c
  //     objects[drawState.selectedNode].strokeColor = c

  //     setDrawState(s => ({ ...s, objects }))
  //   }
  // }

  return (
    <main className={cn("bg-stone-900 min-h-screen text-white", { 'cursor-grab': state.tool == "cursor" && cursorTool.hover })}>
      <canvas ref={canvas}>
      </canvas>

      <div className="absolute top-8 left-1/2 -translate-x-1/2 px-4 py-3 border border-stone-600 rounded-lg">
        <div className="flex gap-3">
          <Button onClick={() => dispatch({ type: 'tool', payload: { tool: 'cursor' } })}>
            [cursor]
          </Button>
          <Button onClick={() => dispatch({ type: 'tool', payload: { tool: 'rect' } })}>
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
