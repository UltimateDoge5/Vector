import { db } from "~/server/db";
import { AssignmentView } from "~/app/(panel)/assignments/[nameId]/view";
import { currentUser } from "@clerk/nextjs";
import { isTeacher as isTeacherCheck } from "~/util/authUtil";
import { type Metadata } from "next";

export async function generateMetadata({ params }: { params: { nameId: string } }):Promise<Metadata>{
	const assignmentId = params.nameId.split("-").pop();
	if (!assignmentId || isNaN(parseInt(assignmentId))) return {title: "Takie zadanie nie istnieje"};

	const assignment = await db.query.Assignment.findFirst({
		where: (c, { eq }) => eq(c.id, parseInt(assignmentId)),
	});

	if (!assignment) return {title: "Takie zadanie nie istnieje"};

	return {
		title: `${assignment.name} - Zadanie | Dziennik Vector`
	}
}

export default async function AssignmentPage({ params }: { params: { nameId: string } }) {
	const assignmentId = params.nameId.split("-").pop();
	if (!assignmentId || isNaN(parseInt(assignmentId))) return <h1>Takie zadanie nie istnieje</h1>;

	const user = await currentUser();
	const isTeacher = isTeacherCheck(user);

	if (isTeacher) {
		// Show all the submissions, and let the teacher edit things
		return <h1>TODO</h1>;
	}

	const assignment = await db.query.Assignment.findFirst({
		where: (c, { eq }) => eq(c.id, parseInt(assignmentId)),
	});

	if (!assignment) return <h1>Takie zadanie nie istnieje</h1>;

	const { id: studentId } = (await db.query.Student.findFirst({
		where: (s, { eq }) => eq(s.userId, user!.id),
		columns: {
			id: true
		},
	}))!;

	const submission = await db.query.Submission.findFirst({
		where: (s, { eq, and }) => and(eq(s.studentId, studentId), eq(s.assignmentId, parseInt(assignmentId))),
	});

	return <AssignmentView assignment={assignment} submission={submission} studentId={studentId} />;
}
