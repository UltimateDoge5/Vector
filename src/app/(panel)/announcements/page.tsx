import { type Metadata } from "next";
import { db } from "~/server/db";
import { AnnouncementsView } from "./view";

export const runtime = "edge";

export const metadata: Metadata = {
	title: "Ogłoszenia | Vector",
};

export default async function Page() {
	const classes = await db.query.Class.findMany({
		columns: {
			id: true,
			name: true,
		},
	});

	const announcements = await db.query.Announcements.findMany()!;

	return <AnnouncementsView classes={classes} announcements={announcements} />;
}
