import { Colors } from "./colors";

export type ActionState = 'idle' | 'selecting' | 'dragging'

export type DrawNode = {
	bounding: [number, number, number, number];
	type: 'square' | 'circle';
	strokeColor: Colors;
	path: Path2D;
	lineWidth: number;
	filled: boolean;
	fillColor: Colors;
}

export type DrawState = {
	actionState: ActionState;
	selectedNode: number;
	hover: boolean;
	objects: DrawNode[];
	mouse: {
		relativeOffset: [number, number]
	}
}
