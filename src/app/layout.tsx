import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";

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
