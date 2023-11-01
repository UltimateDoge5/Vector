import { currentUser } from "@clerk/nextjs";
import AnnouncementsDashboard from "~/components/announcementsDashboard";
import { db } from "~/server/db";
import { isTeacher as isTeacherCheck } from "~/util/authUtil";

export default async function HomePage() {
	const user = await currentUser();

	const isTeacher = isTeacherCheck(user);
	const { announcements, student } = await GetAnnouncements(user!.id);

	if (isTeacher) {
		const announcementsTeacher = announcements.map((ads) => ads).filter((ads) => ads.recipients?.teachers === true);

		return (
			<div className="grid grid-cols-2 p-10">
				<AnnouncementsDashboard announcements={announcementsTeacher} />
			</div>
		);
	}

	const announcementsClass = announcements
		.map((ads) => ads)
		.filter((ads, index) => index <= 2 && ads.recipients?.classes.includes(student!.classId));

	return (
		<div className="grid grid-cols-2 p-10">
			<AnnouncementsDashboard announcements={announcementsClass} />
		</div>
	);
}

const GetAnnouncements = async (userId: string) => {
	const announcements = await db.query.Announcements.findMany({
		orderBy: (announcement, { desc }) => desc(announcement.id),
	});

	const student = await db.query.Student.findFirst({
		where: (student, { eq }) => eq(student.userId, userId),
		columns: {
			classId: true,
		},
	});

	return { announcements, student };
};
