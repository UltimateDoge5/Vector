import { currentUser } from "@clerk/nextjs";
import { ScheduleView, type ISchedule } from "~/app/(panel)/schedule/view";
import { db } from "~/server/db";
import { mapWithExceptions } from "~/util/scheduleUtil";
import { getWeekDates } from "~/util/weekDates";

export const runtime = "edge";

export default async function SchedulePage({ searchParams }: { searchParams: { week: string } }) {
	const user = await currentUser();
	const isTeacher = (user?.privateMetadata.role ?? "student") !== "student";

	const week = getWeekDates(searchParams.week);

	const { schedule, exemptions } = isTeacher ? await getDataForTeacher(user!.id, week) : await getDataForStudent(user!.id, week);

	const finalSchedule: ISchedule[] = schedule.map(
		(schedule) =>
			({
				id: schedule.id,
				dayOfWeek: schedule.dayOfWeek,
				index: schedule.index,
				room: schedule.room,
				lesson: schedule.lesson,
				with: isTeacher ? "Klasa " + schedule.class!.name : schedule.teacher!.name,
				exemption: {
					isExemption: false,
					cancelation: false,
					reason: "",
				},
			}) satisfies ISchedule,
	);

	const mappedSchedule = mapWithExceptions(finalSchedule, exemptions, isTeacher);

	return (
		<ScheduleView
			schedule={finalSchedule}
			title={isTeacher ? "Plan lekcji nauczyciela" : "Twój plan lekcji"}
			weekDate={searchParams.week}
		/>
	);
}

const getDataForStudent = async (userId: string, week: { from: Date; to: Date }) => {
	const schedule = await db.query.Schedule.findMany({
		with: {
			class: {
				with: {
					students: {
						where: (student, { eq }) => eq(student.userId, userId),
						columns: {
							id: true,
						},
					},
				},
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

	return { schedule, exemptions };
};
