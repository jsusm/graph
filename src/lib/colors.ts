export type Colors = 'red' | 'blue'

export const strokeColors: Record<Colors, string> = {
	red: "oklch(0.645 0.246 16.439)",
	blue: "oklch(0.609 0.126 221.723)",
}

export const fillColors = {
	red: 'oklch(0.41 0.159 10.272)',
	blue: 'oklch(0.398 0.07 227.392)',
}

export const selectionColor = {
	line: 'oklch(96.2% 0.059 95.617)'
}
