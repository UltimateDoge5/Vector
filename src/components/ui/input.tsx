import { type ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

type colors = "primary" | "secondary";

export function Input({ children, className, color, ...props }: InputProps & ComponentProps<"input">) {
	const theme: Record<colors, string> = {
		primary: "bg-primary/60 text-text placeholder:text-text/60",
		secondary: "bg-secondary/60 text-text placeholder:text-text/60",
	};

	return (
		<input
			{...props}
			className={twMerge(
				"w-full rounded-md px-4 py-2 dark:focus:border-blue-500 dark:focus:ring-blue-500",
				theme[color ?? "secondary"],
				className,
			)}
		>
			{children}
		</input>
	);
}

interface InputProps {
	color?: colors;
	className?: string;
}
