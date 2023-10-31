import { currentUser } from "@clerk/nextjs";
import { isTeacher as isTeacherCheck } from "~/util/authUtil";
import { db } from "~/server/db";
import { AssignmentsView } from "~/app/(panel)/assignments/view";

export const runtime = "edge";

export default async function AssignmentsPage() {
	const user = await currentUser();
	const isTeacher = isTeacherCheck(user);

	if (isTeacher) {
		return <div>Jeszce nie :(</div>;
	}

	const student = (await db.query.Student.findFirst({
		where: (c, { eq }) => eq(c.userId, user!.id),
		columns: {
			name: false,
		},
	}))!;

	const assignments = await db.query.Assignment.findMany({
		where: (c, { eq }) => eq(c.classId, student.classId),
	});

	return <AssignmentsView assignments={assignments} />;
}
