import "~/styles/globals.css";

import { Inter } from "next/font/google";
import { ClerkProvider, SignedIn, UserButton } from "@clerk/nextjs";
import Sidebar from "~/components/Sidebar";
import Link from "next/link";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-sans",
});

export const metadata = {
	title: "miniature-pancake",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<ClerkProvider>
			<html lang="pl">
				<body
					className={`font-sans ${inter.variable} grid w-full grid-cols-[240px,auto] grid-rows-[96px,auto] gap-y-4 bg-background text-text`}
				>
					<header className="inset-x-0 top-0 col-span-2 flex h-24 w-full items-center justify-center border-b">
						<div className="flex h-16 w-2/3 items-center justify-between">
							<div>
								<Link href="/">LOGO</Link>
							</div>
							<div>
								<SignedIn>
									<UserButton />
								</SignedIn>
							</div>
						</div>
					</header>
					<Sidebar />
					<main className="mx-auto w-full scroll-auto pl-4">{children}</main>
				</body>
			</html>
		</ClerkProvider>
	);
}
