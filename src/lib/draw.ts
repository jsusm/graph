import { fillColors, strokeColors } from "./colors"
import { DrawState } from "./types"

export function draw(c: CanvasRenderingContext2D, state: DrawState) {
	// Clear Canvas
	c.beginPath()
	c.clearRect(0, 0, c.canvas.width, c.canvas.height)

	// Draw objects
	for (let i = 0; i < state.nodes.length; i++) {
		const obj = state.nodes[i]
		// check if object is in screen


		if (obj.type == 'square') {
			c.save()
			c.beginPath()
			obj.path = new Path2D()
			obj.path.roundRect(obj.bounding[0], obj.bounding[1], obj.bounding[2], obj.bounding[3], 4)
			c.lineWidth = obj.lineWidth
			if (obj.filled) {
				c.fillStyle = fillColors[obj.fillColor]
				c.fill(obj.path)
			}
			c.strokeStyle = strokeColors[obj.strokeColor]
			c.stroke(obj.path)
			c.restore()
		}
	}
}
