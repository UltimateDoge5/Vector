import { currentUser } from "@clerk/nextjs";
import { db } from "~/server/db";
import { isTeacher as isTeacherCheck } from "~/util/authUtil";
import GradesView from "./view";

export default async function Grades() {
	const user = await currentUser();
	const isTeacher = isTeacherCheck(user);

	const grades = await getDataForStudent(user!.id);

	return <GradesView grades={grades} />;
}

const getDataForStudent = async (userId: string) => {
	const { id } = (await db.query.Student.findFirst({
		where: (s, { eq }) => eq(s.userId, userId),
		columns: {
			id: true,
		},
	}))!;

	const grades = (
		await db.query.Grade.findMany({
			where: (g, { eq }) => eq(g.studentId, id),
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
			},
		})
	).map((grade) => ({
		id: grade.id,
		name: grade.gradeDefinition!.name,
		value: grade.grade,
		description: grade.description,
		weight: grade.gradeDefinition.weight,
		lesson: grade.gradeDefinition.lesson.name,
	}));

	return grades;
};

export interface IGrade {
	id: number;
	name: string;
	value: number;
	description: string | null;
	weight: number;
	lesson: string;
}
