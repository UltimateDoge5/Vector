import { currentUser } from "@clerk/nextjs";
import { type Metadata } from "next";
import { ScheduleView } from "~/app/(panel)/schedule/view";
import { db } from "~/server/db";
import { type ISchedule, mapWithExceptions } from "~/util/scheduleUtil";
import { getWeekDates } from "~/util/weekDates";

export const runtime = "edge";

export const metadata: Metadata = {
	title: 'Plan zajęć | Vector',
}

export default async function SchedulePage({ searchParams }: { searchParams: { week: string } }) {
	const user = await currentUser();
	const isTeacher = (user?.privateMetadata.role ?? "student") !== "student";

	const week = getWeekDates(searchParams.week);

	const { schedule, exemptions } = isTeacher ? await getDataForTeacher(user!.id, week) : await getDataForStudent(user!.id, week);

	let mappedSchedule: ISchedule[] = schedule.map(
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
		}) satisfies ISchedule,
	);

	// Remap with exemptions
	mappedSchedule = mapWithExceptions(mappedSchedule, exemptions, isTeacher);

	return (
		<ScheduleView
			isTeacher={isTeacher}
			schedule={mappedSchedule}
			weekDate={searchParams.week}
			title={isTeacher ? "Plan lekcji nauczyciela" : "Twój plan lekcji"}
		/>
	);
}

const getDataForStudent = async (userId: string, week: { from: Date; to: Date }) => {
	const student = (await db.query.Student.findFirst({
		where: (stud, { eq }) => eq(stud.userId, userId),
		columns: {
			id: true,
			classId: true,
		},
	}))!;

	const schedule = await db.query.Schedule.findMany({
		where: (schedule, { eq }) => eq(schedule.classId, student.classId),
		with: {
			class: {
				columns: {
					name: true,
				},
			},
			lesson: true,
			teacher: {
				columns: {
					name: true,
				},
			},
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

	// Get student's dismissions
	const presence = await db.query.Presence.findMany({
		where: (presence, { eq, gte, lte, and }) =>
			and(
				eq(presence.studentId, student.classId),
				gte(presence.date, week.from),
				lte(presence.date, week.to),
				eq(presence.status, "released"),
			),

		with: {
			table: {
				columns: {
					teacherId: true,
				},
			},
		},
	});

	// Transform dismissions to exemptions
	presence.forEach((p) => {
		exemptions.push({
			id: p.exemptionId!, //Either id or -1
			class: null,
			lesson: null,
			classId: null,
			lessonId: null,
			scheduleId: p.tableId!, //Either id or -1
			teacherId: p.table!.teacherId,
			teacher: {
				name: "",
			},
			reason: "Zwolnienie z lekcji",
			date: p.date,
			dayOfWeek: null,
			index: null,
			room: null,
			type: "cancelation",
		});
	});

	return { schedule, exemptions };
};

const getDataForTeacher = async (userId: string, week: { from: Date; to: Date }) => {
	const teacher = (await db.query.Teacher.findFirst({
		where: (teach, { eq }) => eq(teach.userId, userId),
		columns: {
			id: true,
		},
	})) as { id: number };

	const schedule = await db.query.Schedule.findMany({
		with: {
			class: {
				columns: {
					name: true,
				},
			},
			lesson: true,
			teacher: {
				columns: {
					name: true,
				},
			},
		},
		where: (schedule, { eq }) => eq(schedule.teacherId, teacher.id),
	});

	const exemptions = await db.query.Exemptions.findMany({
		where: (exemption, { and, gte, lte, eq }) =>
			and(gte(exemption.date, week.from), lte(exemption.date, week.to), eq(exemption.teacherId, teacher.id)),
		with: {
			teacher: {
				columns: {
					name: true,
				},
			},
			class: true,
			lesson: true,
		},
	});

	return { schedule, exemptions, presence: {} };
};
