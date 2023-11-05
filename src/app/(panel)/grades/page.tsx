import { currentUser } from "@clerk/nextjs";
import { type Metadata } from "next";
import { db } from "~/server/db";
import { type Grade } from "~/server/db/schema";
import { getSelectedClass, isTeacher } from "~/util/authUtil";
import { TeacherGradeView } from "./teacherView";
import GradesView from "./view";

export const runtime = "edge";

export const metadata: Metadata = {
	title: "Oceny | Vector",
	description: "Oceny uczniów",
};

export default async function Grades({
	searchParams,
}: {
	searchParams: {
		lesson?: string;
	};
}) {
	const user = await currentUser();

	if (isTeacher(user)) {
		const { lessons, students, className } = await getDataForTeacher(user!.id);
		if (lessons === undefined || lessons.length === 0)
			return (
				<div className="flex w-full flex-col rounded-lg">
					<h2>Brak lekcji z tą klasą</h2>
				</div>
			);

		const grouped: Record<string, ReturnType<typeof groupByStudent>> = {};
		lessons.forEach((lesson) => (grouped[lesson.name] = groupByStudent(lesson)));

		// Check if the selected class is valid
		let selectedClass = searchParams.lesson ?? lessons[0]!.name;
		if (!lessons.some((lesson) => lesson.name === selectedClass)) selectedClass = lessons[0]!.name;

		return (
			<TeacherGradeView lessons={lessons} grades={grouped} initSelection={selectedClass} students={students} className={className} />
		);
	}

	return <GradesView grades={await getDataForStudent(user!.id)} />;
}

const getDataForStudent = async (userId: string) => {
	const { id } = (await db.query.Student.findFirst({
		where: (s, { eq }) => eq(s.userId, userId),
		columns: {
			id: true,
		},
	}))!;

	return (
		await db.query.Grade.findMany({
			where: (g, { eq }) => eq(g.studentId, id),
			with: {
				gradeDefinition: {
					with: {
						lessonGroup: {
							with: {
								lesson: {
									columns: {
										name: true,
									},
								},
							},
							columns: {},
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
		lesson: grade.gradeDefinition!.lessonGroup!.lesson!.name,
		timestamp: grade.timestamp,
	}));
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
			lesson: true,
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
			class: {
				columns: {
					name: true,
				},
			},
		},
	});

	return {
		lessons: lessonGroups.map((lg) => ({
			id: lg.id,
			name: lg.lesson.name,
			gradeDefinitions: lg.gradeDefinitions.map((gd) => ({
				id: gd.id,
				name: gd.name,
				weight: gd.weight,
				grades: gd.grades.map((g) => ({ ...g, studentId: g.studentId })),
			})),
		})),
		className: lessonGroups?.[0]?.class.name ?? "Brak nazwy",
		students,
	};
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
	id: number;
	name: string;
	gradeDefinitions: {
		id: number;
		name: string;
		weight: number;
		grades: (typeof Grade.$inferSelect & {
			studentId: number;
		})[];
	}[];
}

export interface IColDef {
	id: number;
	name: string;
	gradeDefinitions: {
		id: number;
		name: string;
		weight: number;
	}[];
}
