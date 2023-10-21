export const runtime = "edge";
import { currentUser } from "@clerk/nextjs";
import { cookies } from "next/headers";
import { db } from "~/server/db";
import { PresenceView, type IPresence } from "./view";
import { getWeekDates } from "~/util/weekDates";
import { TeacherPresenceView } from "./teacherView";
import { mapWithPresence } from "~/util/scheduleUtil";

export default async function Schedule({ searchParams }: { searchParams: { week: string } }) {
	const selectedClass = parseInt(cookies().get("selectedClassId")?.value ?? "1") ?? 1;
	const user = await currentUser();

	const isTeacher = user?.privateMetadata.role !== "student" ?? false;

	const week = getWeekDates(searchParams.week);

	const { presence, exemptions, schedule } = await getPresenceForStudent(user!.id, week);

	const finalSchedule: IPresence[] = schedule.map(
		(schedule) =>
			({
				id: schedule.id,
				dayOfWeek: schedule.dayOfWeek,
				index: schedule.index,
				room: schedule.room,
				lesson: schedule.lesson,
				with: isTeacher ? "Klasa " + schedule.class!.name : schedule.teacher!.name,
				exemption: {
					id: -1,
					isExemption: false,
					cancelation: false,
					reason: "",
				},
				status: "none",
			}) satisfies IPresence,
	);

	const mappedSchedule = mapWithPresence(finalSchedule, exemptions, presence);

	return <PresenceView presence={mappedSchedule} weekDate={searchParams.week} />;
}

const getAttendenceForClass = async (classId: number, week: { from: Date; to: Date }) => {
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

	const exemptions = await db.query.Exemptions.findMany({
		where: (exemption, { and, lte, gte }) => and(gte(exemption.date, week.from), lte(exemption.date, week.to)),
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

	const presence = await db.query.Presence.findMany({
		where: (presence, { and, gte, lte, inArray, or }) =>
			and(
				gte(presence.date, week.from),
				lte(presence.date, week.to),
				or(
					inArray(
						presence.tableId,
						schedule.map((lesson) => lesson.id),
					),
					inArray(
						presence.exemptionId,
						exemptions.map((exemption) => exemption.id),
					),
				),
			),
	});

	return { schedule, presence, exemptions };
};

const getPresenceForStudent = async (studentId: string, week: { from: Date; to: Date }) => {
	const student = await db.query.Student.findFirst({
		where: (student, { eq }) => eq(student.userId, studentId),
		columns: {
			id: true,
			classId: true,
		},
	});

	const presence = await db.query.Presence.findMany({
		where: (presence, { eq, and, gte, lte }) =>
			and(eq(presence.studentId, student!.id), gte(presence.date, week.from), lte(presence.date, week.to)),
	});

	const schedule = await db.query.Schedule.findMany({
		where: (schedule, { eq }) => eq(schedule.classId, student!.classId),
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
		where: (exemption, { and, lte, gte }) => and(gte(exemption.date, week.from), lte(exemption.date, week.to)),
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
