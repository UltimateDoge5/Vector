import { SignedIn, UserButton, currentUser } from "@clerk/nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import ClassSelector from "~/components/classSelector";
import { Logo } from "~/components/logo";
import { Sidebar } from "~/components/sidebar";
import { db } from "~/server/db";
import { getSelectedClass, isTeacher } from "~/util/authUtil";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	const user = await currentUser();

	return (
		<div className={`grid h-full grid-cols-[240px,auto] grid-rows-[96px,auto] gap-y-4 bg-background text-text`}>
			<header className="inset-x-0 top-0 col-span-2 flex h-24 w-full items-center justify-center border-b">
				<div className="flex h-16 w-2/3 items-center justify-between">
					<div className="flex items-center gap-2">
						<Link href="/">
							<Logo className="h-10 w-10" />
						</Link>
						{isTeacher(user) && (
							<>
								{"/"}
								<Suspense fallback={<div className="h-8 w-32 animate-pulse bg-slate-500">Loading</div>}>
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
			<main className="max-w-[1920px] scroll-auto px-4">{children}</main>
		</div>
	);
}

const ClassSelectorWrapper = async () => {
	let selectedClass = getSelectedClass();
	const classes = await db.query.Class.findMany({
		columns: {
			name: true,
			id: true,
		},
	});

	if (selectedClass === -1) {
		selectedClass = classes[0]!.id;
	}

	return <ClassSelector classes={classes} selectedClassId={selectedClass} />;
};
