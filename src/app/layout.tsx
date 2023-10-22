import { ClerkProvider } from "@clerk/nextjs";
import { type Metadata } from "next";
import { Inter } from "next/font/google";

export const metadata: Metadata = {
	title: "Dziennik Vector",
	description: "Dziennik elektroniczny Vector",
	icons: {
		apple: "/apple-touch-icon.png",
		icon: "/favicon.ico",
	},
	manifest: "/manifest.json",
};

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-sans",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<ClerkProvider>
			<html lang="pl">
				<body className={`font-sans ${inter.variable} h-[100svh]`}>{children}</body>
			</html>
		</ClerkProvider>
	);
}
