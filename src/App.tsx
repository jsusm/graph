import { useEffect, useRef, useState } from "react"
import { strokeColors, fillColors, Colors } from './lib/colors.ts'
import { DrawState } from "./lib/types.ts"
import { draw } from "./lib/draw.ts"
import { useResizeCanvas } from "./hooks/useResizeCanvas.ts"
import { useCanvasLoop } from "./hooks/useCanvasLoop.ts"

function App() {
  const canvas = useRef<HTMLCanvasElement>(null)

  const [drawState, setDrawState] = useState<DrawState>({
    hover: false,
    actionState: 'idle',
    objects: [
      {
        type: 'square',
        bounding: [40, 40, 80, 80],
        strokeColor: 'red',
        path: new Path2D(),
        lineWidth: 2,
        filled: true,
        fillColor: 'red',
      },
      {
        type: 'square',
        bounding: [40, 40, 80, 80],
        strokeColor: 'blue',
        path: new Path2D(),
        lineWidth: 3,
        filled: false,
        fillColor: 'blue',
      }
    ],
    selectedNode: -1,
    mouse: {
      relativeOffset: [0, 0]
    },
  })

  const refDrawState = useRef<DrawState>(drawState)

  useEffect(() => {
    refDrawState.current = drawState

  }, [drawState])

  const { context: ctx } = useCanvasLoop(canvas, refDrawState, draw)
  useResizeCanvas(canvas)

  useEffect(() => {
    setupListeners()
  }, [])

  const setupListeners = () => {
    window.addEventListener('mousemove', (e) => {
      const ds = refDrawState.current
      // check if the mouse is over a node
      let isHover = false
      for (let i = ds.objects.length - 1; i >= 0; i--) {
        const obj = ds.objects[i];
        if (ctx.current) {
          ctx.current.lineWidth = 10
        }
        if (ctx.current?.isPointInStroke(obj.path, e.clientX, e.clientY) || (obj.filled && ctx.current?.isPointInPath(obj.path, e.clientX, e.clientY))) {
          isHover = true;
          break
        }
      }
      setDrawState(s => ({ ...s, hover: isHover }))


      if (ds.actionState == 'dragging') {
        const objects = ds.objects
        const objBounding = objects[ds.selectedNode].bounding
        objects[ds.selectedNode].bounding = [
          ds.mouse.relativeOffset[0] + e.clientX,
          ds.mouse.relativeOffset[1] + e.clientY,
          objBounding[2],
          objBounding[3]
        ]
        setDrawState(s => ({ ...s, objects }))
      }
    })

    canvas.current?.addEventListener('pointerdown', e => {
      setDrawState(ds => ({ ...ds, mouse: { ...ds.mouse, pressedMousePosition: [e.clientX, e.clientY] } }))

      const ds = refDrawState.current
      if (!ds.hover) {
        setDrawState(s => ({
          ...s,
          actionState: 'idle'
        }))
      }

      for (let i = ds.objects.length - 1; i >= 0; i--) {
        const obj = ds.objects[i];
        if (ctx.current) {
          ctx.current.lineWidth = 10
        }
        if (ctx.current?.isPointInStroke(obj.path, e.clientX, e.clientY) || (obj.filled && ctx.current?.isPointInPath(obj.path, e.clientX, e.clientY))) {
          setDrawState(s => ({
            ...s,
            selectedNode: i,
            actionState: 'dragging',
            mouse: {
              relativeOffset: [obj.bounding[0] - e.clientX, obj.bounding[1] - e.clientY]
            }
          }))
          break
        }
      }
    })
    canvas.current?.addEventListener('pointerup', e => {
      const ds = refDrawState.current
      if (ds.actionState == 'dragging') {
        setDrawState(s => ({ ...s, actionState: 'selecting' }))
      }
    })
  }

  function onSelectColor(c: Colors) {
    if (drawState.actionState == 'selecting') {
      const objects = [...drawState.objects]
      objects[drawState.selectedNode].fillColor = c
      objects[drawState.selectedNode].strokeColor = c

      setDrawState(s => ({ ...s, objects }))
    }
  }

  return (
    <main className="bg-stone-900 min-h-screen text-white" style={{
      'cursor': drawState.actionState == 'dragging' ? 'grabbing' : drawState.hover ? 'grab' : 'default'
    }}>
      <canvas ref={canvas}>
      </canvas>

      <div className="absolute top-8 left-1/2 -translate-x-1/2 px-4 py-3 border border-stone-600 rounded-lg">
        <div className="flex gap-3">
          {Object.keys(fillColors).map((c) => {
            let selectedColor = false
            if (drawState.objects[drawState.selectedNode] && drawState.objects[drawState.selectedNode].strokeColor == c) selectedColor = true

            return (
              <button key={c} onClick={() => onSelectColor(c as Colors)} className={`w-6 h-6 rounded-lg border outline-offset-2 outline-stone-500 hover:cursor-pointer hover:brightness-125 transition-all ${selectedColor && 'outline-2'}`} style={{ borderColor: strokeColors[c as Colors], backgroundColor: fillColors[c as Colors] }}>
              </button>
            )
          })}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 pointer-events-none">
        <pre>
          action: {drawState.actionState} <br />
          nodeSelected: {drawState.selectedNode}<br />
          hover: {drawState.hover ? 'true' : 'false'}<br />
        </pre>
      </div>
    </main>
  )
}

export default App
