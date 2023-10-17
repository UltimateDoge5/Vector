import "~/styles/globals.css";

import { Inter } from "next/font/google";
import { ClerkProvider, SignedIn, UserButton } from "@clerk/nextjs";
import Sidebar from "~/Components/Sidebar";
import Link from "next/link";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Create T3 App",
  description: "Generated by create-t3-app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="pl">
        <body className={`font-sans ${inter.variable} bg-background text-text`} >
          <header className="top-0 inset-x-0 w-full h-24 justify-center flex items-center border-b-[1px]">
            <div className="items-center justify-between flex w-2/3 h-16">
              <div>
                <Link href="/">
                  LOGO
                </Link>
              </div>
              <div>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>
            </div>
          </header>
          <div className="w-full pl-[18%] pr-[18%] pt-16 flex">
            <Sidebar/>
            <main className="w-full mx-auto pl-4">
              {children}
            </main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
