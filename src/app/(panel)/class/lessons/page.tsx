import { type Metadata } from "next";
import { db } from "~/server/db";
import { type LessonGroupDto, type ClassDto, type TeacherDto, type LessonDto } from "~/types/dtos";
import { getSelectedClass } from "~/util/authUtil";
import LessonGroupsView from "./view";

export const runtime = "edge";

export const metadata: Metadata = {
	title: "Zajęcia | Vector",
};

export default async function Page() {
	const selectedClassId = getSelectedClass();

	const selectedClass: ClassDto | undefined = await db.query.Class.findFirst({
		columns: {
			id: true,
			name: true,
			teacherId: true
		},
		where: (classRow, { eq }) => eq(classRow.id, selectedClassId)
	});

	if (!selectedClass) {
		return (
			<div className="flex w-full flex-col rounded-lg">
				<h2>Wybierz klasę</h2>
			</div>
		)
	}

	const lessonGroups: LessonGroupDto[] = await db.query.LessonGroup.findMany({
		with: {
			lesson: {},
			teacher: {},
			class: {}
		},
		columns: {
			id: true,
			lessonId: true,
			teacherId: true,
			classId: true
		},
		where: (lessonGroup, { eq }) => eq(lessonGroup.classId, selectedClassId)
	});

	const lessons: LessonDto[] = await db.query.Lesson.findMany();
	const teachers: TeacherDto[] = await db.query.Teacher.findMany();

	return <LessonGroupsView
		lessonGroups={lessonGroups}
		selectedClass={selectedClass}
		lessons={lessons}
		teachers={teachers}
	/>;
}