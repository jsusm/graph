import { ActionDispatch, RefObject, useEffect, useRef, useState } from "react"
import { DrawState } from "../../lib/types"
import { Action } from "../../reducers/appState"

export function usePencilTool(context: { refAppState: RefObject<DrawState>, dispatch: ActionDispatch<[action: Action]>, canvasContext: RefObject<CanvasRenderingContext2D | null> }) {
  const [state, setState] = useState('idle')

  const toolStateRef = useRef({ state })

  useEffect(() => {
    toolStateRef.current = { state }
  }, [state])

  const handlers = () => {
    const pointermove = (e: MouseEvent) => {
      const cc = context.canvasContext.current
      const rs = context.refAppState.current
      const ts = toolStateRef.current
      if (!cc) {
        return
      }

      if (ts.state == "drawing") {
        const node = { ...rs.nodes[rs.selectedNodeIdx] }
        if (node.points) {
          node.points.push(e.clientX - node.bounding[0], e.clientY - node.bounding[1])
        }
        context.dispatch({ type: 'setNode', payload: { id: node.id, nodeData: node } })
      }

    }
    const pointerdown = (e: MouseEvent) => {
      context.dispatch({
        type: 'addNode',
        payload: {
          nodeData: {
            bounding: [e.clientX, e.clientY, 0, 0],
            fillColor: 'red',
            filled: false,
            points: [],
            strokeColor: 'red',
            lineWidth: 2,
            path: new Path2D,
            type: 'scribble',
            id: -1
          }
        }
      })

      setState('drawing')
    }
    const pointerup = (e: MouseEvent) => {
      setState('idle')

      const rs = context.refAppState.current
      const node = { ...rs.nodes[rs.selectedNodeIdx] }

      if (node.points !== undefined) {
        // find biggest coordinate
        let Mx = node.points[0]
        let My = node.points[1]
        let mx = node.points[0]
        let my = node.points[1]

        for (let i = 0; i < node.points.length; i += 2) {
          if (Mx < node.points[i]) Mx = node.points[i]
          if (mx > node.points[i]) mx = node.points[i]
          if (My < node.points[i]) My = node.points[i + 1]
          if (my > node.points[i]) my = node.points[i + 1]
        }

        node.bounding = [mx + node.bounding[0], my + node.bounding[1], Mx + node.bounding[0], My + node.bounding[1]]

        node.points = [...node.points]
        for (let i = 0; i < node.points.length; i += 2) {
          node.points[i] -= mx
          node.points[i + 1] -= my
        }
        context.dispatch({ type: 'setNode', payload: { id: node.id, nodeData: node } })
      } else {
        console.error("Creating scribble but points data is empty")
      }
      context.dispatch({ type: 'editComplete' })
    }

    context.canvasContext.current?.canvas.addEventListener('pointermove', pointermove)
    context.canvasContext.current?.canvas.addEventListener('pointerdown', pointerdown)
    context.canvasContext.current?.canvas.addEventListener('pointerup', pointerup)

    return () => {
      context.canvasContext.current?.canvas.removeEventListener('pointermove', pointermove)
      context.canvasContext.current?.canvas.removeEventListener('pointerdown', pointerdown)
      context.canvasContext.current?.canvas.removeEventListener('pointerup', pointerup)
    }
  }

  return {
    state,
    handlers,
  }
}
