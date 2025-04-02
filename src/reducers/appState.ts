import { DrawNode, DrawState, Tool } from "../lib/types";

export type Action =
	{ type: 'tool'; payload: { tool: Tool } } |
	{ type: 'selectNode'; payload: { nodeId: number } } |
	{ type: 'setNode', payload: { id: number, nodeData: DrawNode } } |
	{ type: 'addNode', payload: { nodeData: DrawNode } } |
	{ type: 'removeNode', payload: { id: number } }

export function appStateReducer(prevState: DrawState, action: Action): DrawState {
	switch (action.type) {
		case 'tool':
			prevState.tool = action.payload.tool
			return { ...prevState, tool: action.payload.tool };

		case 'selectNode':
			return { ...prevState, selectedNodeId: action.payload.nodeId, selectedNodeIdx: prevState.nodes.findIndex(n => n.id == action.payload.nodeId) }

		case 'setNode':
			return { ...prevState, nodes: prevState.nodes.map(n => n.id == action.payload.id ? action.payload.nodeData : n) }

		case 'addNode':
			console.log('adding node')
			return { ...prevState, nodes: [...prevState.nodes, { ...action.payload.nodeData, id: prevState.lastId + 1 }], lastId: prevState.lastId + 1, selectedNodeId: prevState.lastId + 1, selectedNodeIdx: prevState.nodes.length }

		case 'removeNode':
			return { ...prevState, nodes: prevState.nodes.filter(n => n.id != action.payload.id) }

		default:
			return prevState;
	}
}

