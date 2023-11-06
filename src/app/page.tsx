import { Banner } from "~/components/logo";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { Poppins } from "next/font/google";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import HeroImage from "../../public/hero-image.png";
import Image from "next/image";

const poppins = Poppins({
	subsets: ["latin"],
	variable: "--font-poppins",
	weight: "700",
});

export default function landingPage() {
	return (
		<>
			<header className="flex h-24 items-center justify-between px-12 py-2">
				<Banner className="h-full w-32" />

				<Link href="/dashboard">
					<Button>
						<SignedIn>Przejdź do dziennika</SignedIn>
						<SignedOut>Zaloguj się</SignedOut>
					</Button>
				</Link>
			</header>
			<main className="pb-2">
				<div className="relative ml-12 pb-2">
					<div className="mt-16 w-3/5">
						<h1 className={`text-6xl ${poppins.className}`}>
							Twoja cała szkoła w<br />
							<span className="gradientText bg-gradient-to-br from-primary to-accent bg-clip-text leading-snug">
								jednym
							</span>{" "}
							miejscu
						</h1>

						<p className="mt-4 w-4/5 text-xl">
							Vector to innowacyjny dziennik elektroniczny, który pozwala na zarządzanie szkołą w jednym miejscu. Wszystko,
							czego potrzebujesz, aby być zorganizowanym w szkole.
						</p>

						<div className="mt-6 flex items-center gap-2">
							<Link href="/dashboard">
								<Button className="px-6 py-3 hover:shadow-2xl hover:shadow-primary">
									<SignedIn>Przejdź do dziennika</SignedIn>
									<SignedOut>Zaloguj się</SignedOut>
								</Button>
							</Link>
							<a
								href="https://github.com/UltimateDoge5/Vector/wiki/"
								className="inline-flex gap-2 rounded-md px-6 py-3 text-text underline transition-colors hover:bg-slate-200/80 hover:no-underline"
							>
								<BookOpenIcon className="inline-block h-6 w-6" />
								Dokumentacja
							</a>
						</div>
					</div>
					<Image
						src={HeroImage}
						alt="Tabela z planem lekcji"
						height="500"
						className="absolute -right-[30%] -top-10 rounded-2xl border shadow-xl"
					/>
				</div>
			</main>
			<section></section>
		</>
	);
}
