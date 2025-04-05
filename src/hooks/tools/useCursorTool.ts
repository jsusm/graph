import { ActionDispatch, RefObject, useEffect, useRef, useState } from "react"
import { DrawState } from "../../lib/types"
import { Action } from "../../reducers/appState"

export type CursorStage = 'idle' | 'dragging'

export function useCursorTool(context: { refAppState: RefObject<DrawState>, dispatch: ActionDispatch<[action: Action]>, canvasContext: RefObject<CanvasRenderingContext2D | null> }) {
  const [hover, setHover] = useState(false)
  const [state, setState] = useState<CursorStage>('idle')
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
      context.dispatch({ type: 'editComplete' })
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
