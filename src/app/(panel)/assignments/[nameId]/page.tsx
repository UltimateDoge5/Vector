import { db } from "~/server/db";
import { AssignmentView } from "~/app/(panel)/assignments/[nameId]/view";
import { currentUser } from "@clerk/nextjs";
import { isTeacher as isTeacherCheck } from "~/util/authUtil";
import { type Metadata } from "next";
import { TeacherAssignmentView } from "~/app/(panel)/assignments/[nameId]/teacherView";

export const runtime = "edge";

export async function generateMetadata({ params }: { params: { nameId: string } }): Promise<Metadata> {
	const assignmentId = params.nameId.split("-").pop();
	if (!assignmentId || isNaN(parseInt(assignmentId))) return { title: "Takie zadanie nie istnieje" };

	const assignment = await db.query.Assignment.findFirst({
		where: (c, { eq }) => eq(c.id, parseInt(assignmentId)),
	});

	if (!assignment) return { title: "Takie zadanie nie istnieje" };

	return {
		title: `${assignment.name} - Zadanie | Dziennik Vector`,
	};
}

export default async function AssignmentPage({ params }: { params: { nameId: string } }) {
	const assignmentId = params.nameId.split("-").pop();
	if (!assignmentId || isNaN(parseInt(assignmentId))) return <h1>Takie zadanie nie istnieje</h1>;

	const user = await currentUser();
	const isTeacher = isTeacherCheck(user);

	if (isTeacher) {
		// Show all the submissions, and let the teacher edit things
		const { id: teacherId } = (await db.query.Teacher.findFirst({
			where: (c, { eq }) => eq(c.userId, user!.id),
			columns: {
				id: true,
			},
		}))!;

		const assignment = await db.query.Assignment.findFirst({
			where: (c, { eq, and }) => and(eq(c.id, parseInt(assignmentId)), eq(c.teacherId, teacherId)),
		});

		if (!assignment) return <h1>Takie zadanie nie istnieje</h1>;

		const submissions = await db.query.Submission.findMany({
			where: (s, { eq }) => eq(s.assignmentId, parseInt(assignmentId)),
			with: {
				student: {
					columns: {
						classId: false,
						userId: false,
					},
				},
			},
		});

		return <TeacherAssignmentView assignment={assignment} submissions={submissions} />;
	}

	const { id: studentId, class: studentClass } = (await db.query.Student.findFirst({
		where: (s, { eq }) => eq(s.userId, user!.id),
		with: {
			class: {
				columns: {
					id: true,
				},
			},
		},
		columns: {
			id: true,
		},
	}))!;

	const assignment = await db.query.Assignment.findFirst({
		where: (c, { eq, and }) => and(eq(c.id, parseInt(assignmentId)), eq(c.classId, studentClass.id)),
	});

	if (!assignment) return <h1>Takie zadanie nie istnieje</h1>;

	const submission = await db.query.Submission.findFirst({
		where: (s, { eq, and }) => and(eq(s.studentId, studentId), eq(s.assignmentId, parseInt(assignmentId))),
	});

	return <AssignmentView assignment={assignment} submission={submission} studentId={studentId}  />;
}
