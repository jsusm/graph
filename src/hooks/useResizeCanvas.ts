import { RefObject, useEffect } from "react";

// Resize canvas when window is resized
export function useResizeCanvas(canvas: RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const handler = () => {
      if (canvas.current) {
        canvas.current.width = window.innerWidth
        canvas.current.height = window.innerHeight
      }
    }
    handler()
    window.addEventListener('resize', handler)
    return window.removeEventListener('resize', handler)
  }, [])
}
