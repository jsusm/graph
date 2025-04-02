import { Colors } from "./colors";

export type DrawNode = {
	id: number;
	bounding: [number, number, number, number];
	type: 'square' | 'circle';
	strokeColor: Colors;
	path: Path2D;
	lineWidth: number;
	filled: boolean;
	fillColor: Colors;
}

export type Tool = 'cursor' | 'rect'

export type DrawState = {
	tool: Tool;
	selectedNodeId: number;
	selectedNodeIdx: number;
	lastId: number;
	nodes: DrawNode[];
}
