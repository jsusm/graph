import { DrawNode, DrawState } from "../lib/types"

export function loadState(): DrawState {
	const nodeData = localStorage.getItem('nodes')
	let lastId = localStorage.getItem('lastId') ?? 0

	if (typeof lastId == 'string') {
		lastId = parseInt(lastId)
	}

	// create default state
	let drawState: DrawState = { nodes: [], tool: 'cursor', selectedNodeId: -1, selectedNodeIdx: -1, lastId, saved: 0 }

	// parse node Data
	if (nodeData != null) {
		const nodes: DrawNode[] = (JSON.parse(nodeData) as Array<Omit<DrawNode, 'path'>>).map(n => ({
			...n,
			path: new Path2D(),
		}))
		drawState.nodes = nodes
	}

	return drawState
}
