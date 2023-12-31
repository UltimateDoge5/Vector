export const runtime = "edge";
import { currentUser } from "@clerk/nextjs";
import { cookies } from "next/headers";
import { db } from "~/server/db";
import { PresenceView } from "./view";
import { getWeekDates } from "~/util/weekDates";
import { type ClassPresence, TeacherPresenceView } from "./teacherView";
import { type IPresence, type ISchedule, mapWithExemptions, mapWithPresence } from "~/util/scheduleUtil";
import { schoolHours } from "~/util/scheduleUtil";
import { type SQL, inArray } from "drizzle-orm";
import { Exemptions, Presence } from "~/server/db/schema";
import { isTeacher as isTeacherCheck } from "~/util/authUtil";
import { type Metadata } from "next";

export const metadata: Metadata = {
	title: "Frekwencja | Vector",
};

export default async function Schedule({ searchParams }: { searchParams: { week: string } }) {
	const selectedClass = parseInt(cookies().get("selectedClassId")?.value ?? "1") ?? 1;
	const user = await currentUser();

	const isTeacher = isTeacherCheck(user);
	const week = getWeekDates(searchParams.week);

	if (isTeacher) {
		const { schedule, presence, exemptions, studentList } = await getAttendanceForClass(selectedClass, week);

		if (schedule.length === 0) return <h2 className="m-auto w-fit text-3xl">Brak planu dla tej klasy</h2>;

		let mappedSchedule: ISchedule[] = schedule.map(
			(schedule) =>
				({
					id: schedule.id,
					dayOfWeek: schedule.dayOfWeek,
					index: schedule.index,
					room: schedule.room,
					lesson: schedule.lesson,
					with: schedule.teacher!.name,
					exemption: {
						id: null,
						isExemption: false,
						cancelation: false,
						reason: "",
					},
					status: "none",
				}) satisfies IPresence,
		);

		mappedSchedule = mapWithExemptions(mappedSchedule, exemptions, false);

		const classPresence: ClassPresence[] = [];
		const students: ClassPresence["students"] = {};

		// Assign default status to all students
		studentList.forEach((student) => (students[student.id] = { status: "none", name: student.name }));

		mappedSchedule.forEach((lesson) => {
			classPresence.push({
				scheduleId: lesson.id,
				exemptionId: lesson.exemption.id,
				lessonName: lesson.lesson.name!,
				teacherName: lesson.with,
				hours: schoolHours[lesson.index - 1]!,
				students: structuredClone(students), // Clone students without reference
			} satisfies ClassPresence);
		});

		// Assign presence to students
		presence.forEach((presence) => {
			const lesson = classPresence.find(
				(lesson) => lesson.scheduleId === presence.tableId && lesson.exemptionId === presence.exemptionId,
			)!;

			if (lesson) lesson.students[presence.studentId]!.status = presence.status;
		});

		const className = schedule[0]!.class!.name;

		return (
			<TeacherPresenceView
				schedule={mappedSchedule}
				presenceInit={classPresence}
				weekDate={searchParams.week}
				className={className}
			/>
		);
	}

	const { presence, exemptions, schedule } = await getPresenceForStudent(user!.id, week);
	if (schedule.length === 0) return <h2 className="m-auto w-fit text-3xl">Brak planu dla tej klasy</h2>;

	let mappedSchedule: IPresence[] = schedule.map(
		(schedule) =>
			({
				id: schedule.id,
				dayOfWeek: schedule.dayOfWeek,
				index: schedule.index,
				room: schedule.room,
				lesson: schedule.lesson,
				with: isTeacher ? "Klasa " + schedule.class!.name : schedule.teacher!.name,
				exemption: {
					id: null,
					isExemption: false,
					cancelation: false,
					reason: "",
				},
				status: "none",
			}) satisfies IPresence,
	);

	// Remap with presence and exemptions
	mappedSchedule = mapWithPresence(mappedSchedule, exemptions, presence);

	return <PresenceView presence={mappedSchedule} weekDate={searchParams.week} />;
}

const getAttendanceForClass = async (classId: number, week: { from: Date; to: Date }) => {
	const schedule = await db.query.Schedule.findMany({
		where: (schedule, { eq }) => eq(schedule.classId, classId),
		with: {
			lesson: true,
			teacher: {
				columns: {
					name: true,
				},
			},
			class: true,
		},
		columns: {
			id: true,
			dayOfWeek: true,
			index: true,
			room: true,
		},
	});

	const exemptionConditions: SQL<unknown>[] = [];
	if (schedule.length > 0)
		exemptionConditions.push(
			inArray(
				Exemptions.scheduleId,
				schedule.map((s) => s.id),
			),
		);

	const exemptions = await db.query.Exemptions.findMany({
		where: (exemption, { and, lte, gte, eq, or }) =>
			and(gte(exemption.date, week.from), lte(exemption.date, week.to), or(eq(exemption.classId, classId), ...exemptionConditions)),
		with: {
			class: true,
			lesson: true,
			teacher: {
				columns: {
					name: true,
				},
			},
		},
	});

	const conditions: SQL<unknown>[] = [];
	if (schedule.length > 0)
		conditions.push(
			inArray(
				Presence.tableId,
				schedule.map((lesson) => lesson.id),
			),
		);

	if (exemptions.length > 0)
		conditions.push(
			inArray(
				Presence.exemptionId,
				exemptions.map((exemption) => exemption.id),
			),
		);

	const presence = await db.query.Presence.findMany({
		where: (presence, { and, gte, lte, or }) => and(gte(presence.date, week.from), lte(presence.date, week.to), or(...conditions)),
	});

	const students = await db.query.Student.findMany({
		where: (student, { eq }) => eq(student.classId, classId),
		columns: {
			id: true,
			name: true,
		},
	});

	return { schedule, presence, exemptions, studentList: students };
};

const getPresenceForStudent = async (userId: string, week: { from: Date; to: Date }) => {
	const student = (await db.query.Student.findFirst({
		where: (student, { eq }) => eq(student.userId, userId),
		columns: {
			id: true,
			classId: true,
		},
	}))!

	const presence = await db.query.Presence.findMany({
		where: (presence, { eq, and, gte, lte }) =>
			and(eq(presence.studentId, student.id), gte(presence.date, week.from), lte(presence.date, week.to)),
	});

	const schedule = await db.query.Schedule.findMany({
		where: (schedule, { eq }) => eq(schedule.classId, student.classId),
		with: {
			lesson: true,
			teacher: {
				columns: {
					name: true,
				},
			},
			class: true,
		},
		columns: {
			id: true,
			dayOfWeek: true,
			index: true,
			room: true,
		},
	});

	const exemptions = await db.query.Exemptions.findMany({
		where: (exemption, { and, lte, gte, or, inArray,eq }) =>
			and(
				gte(exemption.date, week.from),
				lte(exemption.date, week.to),
				or(
					eq(exemption.classId, student.classId),
					inArray(
						exemption.scheduleId,
						schedule.map((s) => s.id),
					),
				),
			),
		with: {
			class: true,
			lesson: true,
			teacher: {
				columns: {
					name: true,
				},
			},
		},
	});

	return { presence, exemptions, schedule };
};
