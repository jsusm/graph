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
      if ((e.target as HTMLElement).tagName != 'CANVAS') return

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
      console.log(context.refAppState.current.nodes[context.refAppState.current.selectedNodeIdx].bounding)
      if (state == 'drawing') {
        setState('idle')
        context.dispatch({ type: 'tool', payload: { tool: 'cursor' } })
        context.dispatch({ type: 'editComplete' })
      }
    }

    document.addEventListener('pointermove', pointermove)
    document.addEventListener('pointerdown', pointerdown)
    document.addEventListener('pointerup', pointerup)

    return () => {
      document.removeEventListener('pointermove', pointermove)
      document.removeEventListener('pointerdown', pointerdown)
      document.removeEventListener('pointerup', pointerup)
    }
  }

  return {
    state,
    handlers,
  }
}
