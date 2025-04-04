import { useEffect, useRef } from "react";

export function useCanvasContext(canvas: React.RefObject<HTMLCanvasElement | null>) {
  const context = useRef<CanvasRenderingContext2D | null>(null)

  useEffect(() => {
    if (canvas.current == null) {
      throw Error("Canvas is null, Cannot initialize rendering loop.")
    }
    // set up canvas context
    const c = canvas.current.getContext('2d')
    if (c) {
      context.current = c
    } else {
      throw Error("Cannot initialize rendering context")
    }
  })

  return { context }
}
