import "~/styles/globals.css";

import { SignedIn, UserButton, currentUser } from "@clerk/nextjs";
import Link from "next/link";
import { Sidebar } from "~/components/sidebar";
import ClassSelector from "~/components/classSelector";
import { cookies } from "next/headers";
import { db } from "~/server/db";
import { Suspense } from "react";
import { headers } from "next/headers";
import { Logo } from "~/components/logo";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	const user = await currentUser();
	const isTeacher = (user?.privateMetadata.role ?? "student") !== "student";

	return (
		<div className={`grid h-full w-full grid-cols-[240px,auto] grid-rows-[96px,auto] gap-y-4 bg-background text-text`}>
			<header className="inset-x-0 top-0 col-span-2 flex h-24 w-full items-center justify-center border-b">
				<div className="flex h-16 w-2/3 items-center justify-between">
					<div className="flex items-center gap-2">
						<Link href="/">
							<Logo className="h-10 w-10" />
						</Link>
						{isTeacher && (
							<>
								{"/"}
								<Suspense fallback={<div className="animate-pulse bg-slate-500">Loading</div>}>
									<ClassSelectorWrapper />
								</Suspense>
							</>
						)}
					</div>
					<div>
						<SignedIn>
							<UserButton afterSignOutUrl="/" />
						</SignedIn>
					</div>
				</div>
			</header>
			<Sidebar />
			<main className="mx-auto w-full scroll-auto pl-4">{children}</main>
		</div>
	);
}

const ClassSelectorWrapper = async () => {
	let selectedClass = parseInt(cookies().get("selectedClassId")?.value ?? "-1");
	const classes = await db.query.Class.findMany({
		columns: {
			name: true,
			id: true,
		},
	});

	if (selectedClass === -1) {
		selectedClass = classes[0]!.id;
	}

	const headersList = headers();

	return <ClassSelector classes={classes} selectedClassId={selectedClass} url={headersList.get("next-url")!} />;
};
