import { useEffect, useRef, RefObject } from "react";
import { DrawState } from "../lib/types";

/* 
 * Create rendering context and setup rendering loop
 */
export function useCanvasLoop(canvas: RefObject<HTMLCanvasElement | null>, refState: RefObject<DrawState>, draw: (c: CanvasRenderingContext2D, state: DrawState) => void) {
  const context = useRef<CanvasRenderingContext2D | null>(null)

  useEffect(() => {
    if (canvas.current == null) {
      throw Error("Canvas is null, Cannot initialize rendering loop.")
    }
    // set up canvas context
    const c = canvas.current.getContext('2d')
    if (c) {
      canvas.current.width = canvas.current.width
      canvas.current.height = canvas.current.height

      context.current = c
    } else {
      throw Error("Cannot initialize rendering context")
    }

    function loop() {
      if (c) {
        draw(c, refState.current)
      }
      requestAnimationFrame(loop)
    }
    loop()
  }, [])

  return { context }
}
