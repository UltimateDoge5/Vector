import { SignedIn, UserButton, currentUser } from "@clerk/nextjs";
import Link from "next/link";
import { Suspense } from "react";
import ClassSelector from "~/components/classSelector";
import { Banner, Logo } from "~/components/logo";
import { Sidebar } from "~/components/sidebar";
import { db } from "~/server/db";
import { getSelectedClass, isTeacher } from "~/util/authUtil";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	const user = await currentUser();

	return (
		<div className={`grid min-h-full grid-cols-[240px,auto] grid-rows-[96px,auto] gap-y-4 bg-background pb-24 text-text`}>
			<header className="inset-x-0 top-0 col-span-2 flex h-24 w-full items-center justify-center border-b">
				<div className="flex h-16 w-2/3 items-center justify-between">
					<div className="flex items-center gap-2">
						{isTeacher(user) ? (
							<>
								<Link href="/">
									<Logo className="h-10 w-10" />
								</Link>
								{"/"}
								<Suspense fallback={<div className="bg-secndary/60 h-8 w-32 animate-pulse">Loading</div>}>
									<ClassSelectorWrapper />
								</Suspense>
							</>
						):(
							<Link href="/">
								<Banner className="w-28"/>
							</Link>
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
			<ToastContainer position="bottom-left" />
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
