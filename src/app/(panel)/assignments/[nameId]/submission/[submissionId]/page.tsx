import { currentUser } from "@clerk/nextjs";
import { isTeacher } from "~/util/authUtil";
import { redirect } from "next/navigation";
import { StudentsSubmissionView } from "~/app/(panel)/assignments/[nameId]/submission/[submissionId]/view";
import { db } from "~/server/db";

export default async function Page({ params }: { params: { nameId: string, submissionId: string } }) {
	const user = await currentUser()
	// if(!isTeacher(user)) return redirect("/assignments")

	const assignmentId = params.nameId.split("-").pop()!;
	const submissionId = params.submissionId.split("-").pop()!;

	const { id: teacherId } = (await db.query.Teacher.findFirst({
		where: (c, { eq }) => eq(c.userId, "user_2WtVEuDuEZ3mNPCRvGUs6jMogLx"),
		columns: {
			id: true,
		},
	}))!;

	const assignment = await db.query.Assignment.findFirst({
		where: (c, { eq, and }) => and(eq(c.id, parseInt(assignmentId)), eq(c.teacherId, teacherId)),
	});

	if(!assignment) return <h1>Takie zadanie nie istnieje</h1>

	const submission = await db.query.Submission.findFirst({
		where: (s, { eq,and }) => and(eq(s.id, parseInt(submissionId)), eq(s.assignmentId, assignment.id)),
	});

	if(!submission) return <h1>Takie zadanie ucznia nie istnieje</h1>

	const studentName = params.submissionId.replaceAll("-"," ").slice(0,-1*submissionId.length-1)

	return <StudentsSubmissionView assignment={assignment} submission={submission} studentName={studentName} />
}