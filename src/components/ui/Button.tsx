import React from "react";
import { cn } from "../../lib/classMerge";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { }

export const Button = React.forwardRef<HTMLButtonElement, IconButtonProps>((props, ref) => {
	return <button {...props} ref={ref} className={cn("leading-6 h-6 text-sm text-stone-300 hover:cursor-pointer hover:text-stone-100 hover:bg-amber-700 font-mono transition-colors", props.className)} />
})
