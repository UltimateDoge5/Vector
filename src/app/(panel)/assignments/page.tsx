import { currentUser } from "@clerk/nextjs";
import { getSelectedClass, isTeacher as isTeacherCheck } from "~/util/authUtil";
import { db } from "~/server/db";
import { AssignmentsListView } from "~/app/(panel)/assignments/view";
import { type Metadata } from "next";
import { TeacherView } from "~/app/(panel)/assignments/TeacherView";
import { Student, Submission } from "~/server/db/schema";
import { eq, sql } from "drizzle-orm";

export const runtime = "edge";
export const metadata = {
	title: "Zadania | Dziennik Vector",
} satisfies Metadata;

export default async function AssignmentsPage() {
	const user = await currentUser();
	const isTeacher = isTeacherCheck(user);

	if (true) {
		const classId = getSelectedClass();
		const { id: teacherId } = (await db.query.Teacher.findFirst({
			where: (c, { eq }) => eq(c.userId, "user_2WtVEuDuEZ3mNPCRvGUs6jMogLx"),
			columns: {
				id: true,
			},
		}))!;

		const assignments = await db.query.Assignment.findMany({
			where: (a, { eq, and }) => and(eq(a.classId, classId), eq(a.teacherId, teacherId)),
		});

		const submissionCount = await db
			.select({ count: sql<number>`count(*)`, assignmentId: Submission.assignmentId })
			.from(Submission)
			.groupBy(Submission.assignmentId);

		const classSize = await db
			.select({ count: sql<number>`count(*)` })
			.from(Student)
			.where(eq(Student.classId, classId));

		return <TeacherView assignments={assignments} classSize={classSize[0]!.count} submissionCount={submissionCount} />;
	}

	const student = (await db.query.Student.findFirst({
		where: (c, { eq }) => eq(c.userId, user!.id),
		with: {
			submissions: true,
		},
		columns: {
			name: false,
		},
	}))!;

	const assignments = await db.query.Assignment.findMany({
		where: (c, { eq }) => eq(c.classId, student.classId),
	});

	return <AssignmentsListView assignments={assignments} submissions={student.submissions} />;
}
