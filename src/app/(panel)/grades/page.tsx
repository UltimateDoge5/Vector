import { currentUser } from "@clerk/nextjs";
import { type Metadata } from "next";
import { db } from "~/server/db";
import { type Grade } from "~/server/db/schema";
import { getSelectedClass } from "~/util/authUtil";
import { TeacherGradeView } from "./teacherView";
import GradesView from "./view";

export const metadata: Metadata = {
	title: "Dziennik Vector | Oceny",
	description: "Oceny uczniów",
};

export default async function Grades({ searchParams }: { searchParams: { lesson?: string } }) {
	const user = await currentUser();

	// console.log(await getDataForTeacher("user_2WtVEuDuEZ3mNPCRvGUs6jMogLx"));

	if (true) {
		const { lessons, students, className } = await getDataForTeacher("user_2WtVEuDuEZ3mNPCRvGUs6jMogLx");
		if (lessons === undefined)
			return (
				<div className="flex w-full flex-col rounded-lg">
					<h2>Brak lekcji z tą klasą</h2>
				</div>
			);

		const grouped: Record<string, ReturnType<typeof groupByStudent>> = {};
		lessons.forEach((lesson) => (grouped[lesson.name] = groupByStudent(lesson)));

		const gradelessLessons = lessons.map((lesson) => ({
			name: lesson.name,
			gradeDefinitions: lesson.gradeDefinitions.map((def) => ({
				id: def.id,
				name: def.name,
				weight: def.weight,
			})),
		}));

		return (
			<TeacherGradeView
				lessons={lessons}
				grades={grouped}
				initSelection={searchParams.lesson ?? lessons[0]!.name}
				students={students}
				className={className}
			/>
		);
	}

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

	return grades;
};

const getDataForTeacher = async (userId: string) => {
	const selectedClass = getSelectedClass();

	const { id } = (await db.query.Teacher.findFirst({
		where: (t, { eq }) => eq(t.userId, userId),
		columns: {
			id: true,
		},
	}))!;

	const students = await db.query.Student.findMany({
		where: (s, { eq }) => eq(s.classId, selectedClass),
		columns: {
			id: true,
			name: true,
		},
	})!;

	const lessonGroups = await db.query.LessonGroup.findMany({
		where: (lg, { eq, and }) => and(eq(lg.classId, selectedClass), eq(lg.teacherId, id)),
		with: {
			lesson: {
				with: {
					gradeDefinitions: {
						with: {
							grades: true,
						},
						columns: {
							id: true,
							name: true,
							weight: true,
						},
					},
				},
				columns: {
					name: true,
				},
			},
			class: {
				columns: {
					name: true,
				},
			},
		},
	});

	return { lessons: lessonGroups.map((lg) => lg.lesson[0]!), students, className: lessonGroups?.[0]?.class[0]?.name ?? "Brak nazwy" };
};

const groupByStudent = (selectedLesson: ILesson) => {
	const grouped: Record<number, Omit<IGrade, "lesson" | "weight">[]> = {};

	selectedLesson.gradeDefinitions.forEach((def) => {
		def.grades.forEach((grade) => {
			if (!grouped[grade.studentId]) {
				grouped[grade.studentId] = [];
			}

			grouped[grade.studentId]!.push({
				value: grade.grade,
				name: def.name,
				description: grade.description,
				timestamp: grade.timestamp,
				id: grade.id,
			});
		});
	});

	return grouped;
};

export interface IGrade {
	id: number;
	name: string;
	value: number;
	description: string | null;
	weight: number;
	lesson: string;
	timestamp: Date;
}

export interface ILesson {
	name: string;
	gradeDefinitions: {
		id: number;
		name: string;
		weight: number;
		grades: (typeof Grade.$inferSelect & { studentId: number })[];
	}[];
}

export interface IColDef {
	name: string;
	gradeDefinitions: {
		id: number;
		name: string;
		weight: number;
	}[];
}
