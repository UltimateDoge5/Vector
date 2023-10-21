import { plPL } from "@clerk/localizations";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "../styles/globals.css";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-sans",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<ClerkProvider
			localization={plPL}
			appearance={{
				variables: {
					colorPrimary: "#91cfed",
					colorTextOnPrimaryBackground: "#030512",
				},
			}}
		>
			<html lang="pl">
				<body className={`font-sans ${inter.variable} h-[100svh]`}>{children}</body>
			</html>
		</ClerkProvider>
	);
}
