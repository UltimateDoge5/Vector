"use client";
import { type ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

const common = `inline-flex justify-center items-center rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
 enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 px-4 py-2 transition-all disabled:grayscale`;

export function Button({ icon, children, color, className, loading, ...props }: ButtonProps & ComponentProps<"button">) {
	const theme: Record<colors, string> = {
		primary: `bg-primary`,
		secondary: "bg-secondary",
	};

	return (
		<button {...props} className={twMerge(common, theme[color ?? "primary"], className)}>
			{icon && !loading && <>{icon}</>}
			{loading && <LoadingIcon />}
			{children}
		</button>
	);
}

const LoadingIcon = () => (
	<svg className="-ml-1 mr-3 h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
		<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
		<path
			className="opacity-75"
			fill="currentColor"
			d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
		/>
	</svg>
);

type colors = "primary" | "secondary";

interface ButtonProps {
	icon?: JSX.Element;
	loading?: boolean;
	color?: colors;
	className?: string;
	children: React.ReactNode | string;
}
