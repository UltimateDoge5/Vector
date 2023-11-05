import { SignIn } from "@clerk/nextjs";
import "~/styles/globals.css";

export const metadata = {
	title: "Zaloguj się | Vector",
};

// This page really likes to avoid tailwind styles, so I have to use inline styles.
export default function Page() {
	return (
		<main
			className="flex h-screen w-full flex-col items-center justify-center"
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				height: "100svh",
				fontFamily: "var(--font-sans)",
			}}
		>
			<SignIn
				appearance={{
					elements: {
						footer: "hidden",
					},
				}}
			/>
		</main>
	);
}
