import { ActionDispatch, RefObject, useEffect, useRef, useState } from "react"
import { DrawState, Shape } from "../../lib/types"
import { Action } from "../../reducers/appState"

export function useSimpleShapeTool(context: { refAppState: RefObject<DrawState>, dispatch: ActionDispatch<[action: Action]>, canvasContext: RefObject<CanvasRenderingContext2D | null> }, shape: Shape) {
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
        node.bounding[2] = e.clientX - node.bounding[0]
        node.bounding[3] = e.clientY - node.bounding[1]

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
            strokeColor: 'red',
            lineWidth: 2,
            path: new Path2D,
            type: shape,
            id: -1
          }
        }
      })

      setState('drawing')
    }
    const pointerup = (e: MouseEvent) => {
      setState('idle')
      context.dispatch({ type: 'tool', payload: { tool: 'cursor' } })
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
