import { useEffect, useReducer, useRef, useState } from "react"

type ActionState = 'idle' | 'draging'

function actionReducer(state: ActionState, action: string) {
  // Node transitions
  if (state == 'idle') {
    switch (action) {
      case 'mousedown':
        return 'draging'
    }
  }
  if (state == 'draging') {
    switch (action) {
      case 'mouseup':
        return 'idle';
    }
  }
  throw Error(`Unknown action: ${action} for state ${state}`)
}

function App() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const ctx = useRef<CanvasRenderingContext2D | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, lx: 0, ly: 0 })
  const [actionState, dispatchAction] = useReducer(actionReducer, 'idle')
  const action = useRef('idle')

  const [shapeOrigin, setShapeOriging] = useState({ x: 0, y: 0 })

  useEffect(() => {
    action.current = actionState
  }, [actionState])

  useEffect(() => {
    const rect = window.document.body.getBoundingClientRect()

    const c = canvas.current?.getContext('2d')
    if (c && canvas.current) {
      canvas.current.width = rect.width
      canvas.current.height = rect.height

      c.strokeStyle = '#fff'
      c.lineWidth = 3

      ctx.current = c
    }

    const mouseover = (e: MouseEvent) => {
      setMousePos(s => ({ x: e.clientX, y: e.clientY, lx: s.x, ly: s.y }))
    }
    canvas.current?.addEventListener('mousemove', mouseover)

    addEventListener('pointerrawupdate', (e) => {
      console.log(e)
    })

    const mousedown = (e: MouseEvent) => {
      if (action.current == 'idle') {
        dispatchAction('mousedown')
        setShapeOriging({ x: e.clientX, y: e.clientY })
      }
    }
    canvas.current?.addEventListener('mousedown', mousedown)

    const mouseup = (_: MouseEvent) => {
      if (action.current == 'draging') {
        dispatchAction('mouseup')
      }
    }
    canvas.current?.addEventListener('mouseup', mouseup)

    return () => {
      canvas.current?.removeEventListener('mousemove', mouseover)
      canvas.current?.removeEventListener('mouseup', mouseup)
      canvas.current?.removeEventListener('mousedown', mousedown)
    }
  }, [])

  useEffect(() => {
    if (ctx.current != null) {
      const c = ctx.current
      c.clearRect(0, 0, c.canvas.width, c.canvas.height)

      c.beginPath()
      c.translate(mousePos.x, mousePos.y)
      c.rect(-10, -10, 20, 20)
      c.stroke()
      c.resetTransform()


      if (actionState == "draging") {
        c.save()
        c.beginPath()
        c.translate(shapeOrigin.x, shapeOrigin.y)
        c.rect(0, 0, mousePos.x - shapeOrigin.x, mousePos.y - shapeOrigin.y)
        c.stroke()
        c.restore()
      }

    }
  }, [mousePos])

  return (
    <main className="bg-stone-900 min-h-screen text-white">
      <canvas ref={canvas}>
      </canvas>

      <div className="absolute top-0 left-0">
        <pre>
          state: {actionState}
        </pre>
      </div>
    </main>
  )
}

export default App
