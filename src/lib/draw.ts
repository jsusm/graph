import { fillColors, selectionColor, strokeColors } from "./colors"
import { DrawState } from "./types"

let smoothLineLevel = 0

export function draw(c: CanvasRenderingContext2D, state: DrawState) {
	// Clear Canvas
	c.beginPath()
	c.clearRect(0, 0, c.canvas.width, c.canvas.height)

	/*
	 * Draw Shapes
	 */
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

			let rx = obj.bounding[2] / 2
			let ry = obj.bounding[3] / 2
			if (rx < 0) rx *= -1
			if (ry < 0) ry *= -1

			obj.path = new Path2D()
			obj.path.ellipse(
				(obj.bounding[0] + obj.bounding[0] + obj.bounding[2]) / 2,
				(obj.bounding[1] + obj.bounding[1] + obj.bounding[3]) / 2,
				rx,
				ry,
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
				if (smoothLineLevel == 2) {
					for (let i = 2; i < obj.points.length; i += 6) {
						obj.path.bezierCurveTo(
							obj.bounding[0] + obj.points[i],
							obj.bounding[1] + obj.points[i + 1],
							obj.bounding[0] + obj.points[i + 2],
							obj.bounding[1] + obj.points[i + 3],
							obj.bounding[0] + obj.points[i + 4],
							obj.bounding[1] + obj.points[i + 5],
						)
					}
				}
				else if (smoothLineLevel == 1) {
					for (let i = 2; i < obj.points.length; i += 4) {
						obj.path.quadraticCurveTo(
							obj.bounding[0] + obj.points[i],
							obj.bounding[1] + obj.points[i + 1],
							obj.bounding[0] + obj.points[i + 2],
							obj.bounding[1] + obj.points[i + 3],
						)
					}
				}
				else {
					for (let i = 2; i < obj.points.length; i += 2) {
						obj.path.lineTo(
							obj.bounding[0] + obj.points[i],
							obj.bounding[1] + obj.points[i + 1],
						)
					}
				}
				c.lineWidth = obj.lineWidth
				c.strokeStyle = strokeColors[obj.strokeColor]
				c.stroke(obj.path)
				c.restore()
			}
		}
	}


	/*
	 * Draw selection
	 */
	const padding = 8
	if (state.tool == 'cursor' && state.selectedNodeIdx != -1) {
		const obj = state.nodes[state.selectedNodeIdx]
		c.save()
		c.beginPath()
		c.strokeStyle = selectionColor.line
		c.lineWidth = 1
		c.rect(
			obj.bounding[0] - padding,
			obj.bounding[1] - padding,
			obj.bounding[2] + padding * 2,
			obj.bounding[3] + padding * 2,
		)

		c.stroke()
		c.restore()
	}
}
