import { db } from "~/server/db";
import { AnnouncementsView } from "./view";

export const runtime = "edge";

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
