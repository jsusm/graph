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


		if (obj.type == 'rect') {
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
		if (obj.type == 'elipce') {
			c.save()
			c.beginPath()
			obj.path = new Path2D()
			obj.path.ellipse(
				(obj.bounding[0] + obj.bounding[0] + obj.bounding[2]) / 2,
				(obj.bounding[1] + obj.bounding[1] + obj.bounding[3]) / 2,
				obj.bounding[2] / 2,
				obj.bounding[3] / 2,
				0,
				0,
				Math.PI * 2,
			)
			c.lineWidth = obj.lineWidth
			if (obj.filled) {
				c.fillStyle = fillColors[obj.fillColor]
				c.fill(obj.path)
			}
			c.strokeStyle = strokeColors[obj.strokeColor]
			c.stroke(obj.path)
			c.restore()
		}
		if (obj.type == 'line') {
			c.save()
			c.beginPath()
			obj.path = new Path2D()
			obj.path.moveTo(
				obj.bounding[0],
				obj.bounding[1],
			)
			obj.path.lineTo(
				obj.bounding[0] + obj.bounding[2],
				obj.bounding[1] + obj.bounding[3],
			)
			c.lineWidth = obj.lineWidth
			c.strokeStyle = strokeColors[obj.strokeColor]
			c.stroke(obj.path)
			c.restore()
		}
		if (obj.type == 'scribble') {
			c.save()
			c.beginPath()
			obj.path = new Path2D()
			if (obj.points === undefined) {
				c.restore()
				console.error("Trying to draw scribble but points array is empty")
			} else {
				obj.path.moveTo(
					obj.bounding[0] + obj.points[0],
					obj.bounding[1] + obj.points[1],
				)
				for (let i = 2; i < obj.points.length; i += 2) {
					obj.path.lineTo(
						obj.bounding[0] + obj.points[i],
						obj.bounding[1] + obj.points[i + 1],
					)
				}
				c.lineWidth = obj.lineWidth
				c.strokeStyle = strokeColors[obj.strokeColor]
				c.stroke(obj.path)
				c.restore()
			}

		}
	}
}
