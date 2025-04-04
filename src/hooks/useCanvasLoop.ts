import { useEffect, useRef, RefObject } from "react";
import { DrawState } from "../lib/types";

/* 
 * Create rendering context and setup rendering loop
 */
export function useCanvasLoop(context: RefObject<CanvasRenderingContext2D | null>, refState: RefObject<DrawState>, draw: (c: CanvasRenderingContext2D, state: DrawState) => void) {
  useEffect(() => {
    function loop() {
      if (context.current) {
        draw(context.current, refState.current)
      }
      requestAnimationFrame(loop)
    }
    loop()
  }, [])

  return { context }
}
