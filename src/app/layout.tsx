import { plPL } from "@clerk/localizations";
import { ClerkProvider } from "@clerk/nextjs";
import { type Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from '@vercel/analytics/react';
import "../styles/globals.css";
import React from "react";

export const metadata: Metadata = {
	metadataBase: new URL("https://vector.pkozak.org"),
	title: "Dziennik Vector",
	description: "Dziennik elektroniczny Vector",
	icons: {
		apple: "/apple-touch-icon.png",
		icon: "/favicon.ico",
	},
	manifest: "/manifest.json",
	openGraph: {
		type: "website",
		images: ["/banner.png"],
	},
	robots: {
		index: false,
	},
};

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-sans",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<ClerkProvider
			localization={plPL}
			afterSignInUrl="/dashboard"
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
			 <Analytics />
		</ClerkProvider>
	);
}
