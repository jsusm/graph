import { Colors } from "./colors";

export type Shape = 'rect' | 'elipce' | 'line' | 'scribble'

export type DrawNode = {
	id: number;
	bounding: [number, number, number, number];
	points?: number[],
	type: Shape;
	strokeColor: Colors;
	path: Path2D;
	lineWidth: number;
	filled: boolean;
	fillColor: Colors;
}

export type Tool = 'cursor' | 'rect' | 'elipce' | 'line' | 'pencil'

export type DrawState = {
	tool: Tool;
	selectedNodeId: number;
	selectedNodeIdx: number;
	lastId: number;
	nodes: DrawNode[];
}
