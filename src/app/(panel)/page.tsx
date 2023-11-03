import { currentUser } from "@clerk/nextjs";
import { Suspense } from "react";
import AnnouncementsDashboard from "~/components/announcementsDashboard";
import GradesDashboard from "~/components/gradesDashboard";
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
				<Suspense fallback={<p>Ładowanie...</p>}>
					<AnnouncementsDashboard announcements={announcementsTeacher} />
				</Suspense>
			</div>
		);
	}
	const { grades } = await GetGrades(user!.id);

	const announcementsClass = announcements
		.map((ads) => ads)
		.filter((ads, index) => index <= 2 && ads.recipients?.classes.includes(student!.classId));

	return (
		<div className="grid grid-cols-2 p-10">
			<Suspense fallback={<p>Ładowanie...</p>}>
				<AnnouncementsDashboard announcements={announcementsClass} />
				<GradesDashboard grades={grades} />
			</Suspense>
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

const GetGrades = async (userId: string) => {
	const student = await db.query.Student.findFirst({
		where: (student, { eq }) => eq(student.userId, userId),
	});
	const date = new Date();
	const grades = (
		await db.query.Grade.findMany({
			where: (g, { eq, and, gte }) =>
				and(
					eq(g.studentId, student!.id),
					gte(g.timestamp, new Date(`${date.getFullYear()}-${date.getMonth() + 1}-01T00:00:00.000Z`)),
				),
			with: {
				gradeDefinition: {
					with: {
						lesson: {
							columns: {
								name: true,
							},
						},
					},
					columns: {
						name: true,
						weight: true,
					},
				},
			},
			columns: {
				id: true,
				grade: true,
				description: true,
				timestamp: true,
			},
		})
	).map((grade) => ({
		id: grade.id,
		name: grade.gradeDefinition!.name,
		value: grade.grade,
		description: grade.description,
		weight: grade.gradeDefinition.weight,
		lesson: grade.gradeDefinition.lesson.name,
		timestamp: grade.timestamp,
	}));

	return { grades };
};
