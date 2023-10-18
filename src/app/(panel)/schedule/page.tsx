import { currentUser } from "@clerk/nextjs";
import { ScheduleView, type ISchedule } from "~/app/(panel)/schedule/view";
import { db } from "~/server/db";

export const runtime = "edge";

export default async function SchedulePage({ searchParams }: { searchParams: { week: string } }) {
	const user = await currentUser();
	const isTeacher = user?.privateMetadata.role ?? "student" !== "student";

	const week = {
		from: new Date(),
		to: new Date(),
	};

	// Get the first and last day of the week
	const date = searchParams.week ? new Date(searchParams.week) : new Date();
	const day = date.getDay();
	const diff = date.getDate() - day + (day == 0 ? -6 : 1);

	week.from = new Date(date.setDate(diff));
	week.from.setHours(0, 0, 0); // Set the time to 00:00:00, exemptions are stored whith the same time
	week.to = new Date(date.setDate(diff + 6));
	week.to.setHours(0, 0, 0);

	const { schedule, exemptions } = isTeacher ? await getDataForTeacher(user!.id, week) : await getDataForStudent(user!.id, week);
	// const { schedule, exemptions } = await getDataForTeacher("user_2WtVEuDuEZ3mNPCRvGUs6jMogLx", week);

	const finalSchedule: ISchedule[] = schedule.map(
		(schedule) =>
			({
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

	exemptions.forEach((exemption) => {
		switch (exemption.type) {
			case "addition":
				finalSchedule.push({
					dayOfWeek: exemption.dayOfWeek!,
					index: exemption.index!,
					room: exemption.room!,
					lesson: exemption.lesson!,
					with: isTeacher ? "Klasa " + exemption.class!.name : exemption.teacher!.name,
					exemption: {
						isExemption: true,
						cancelation: false,
						reason: exemption.reason,
					},
				});
				break;
			case "change":
				const index = schedule.findIndex((lesson) => lesson.id == exemption.scheduleId);

				finalSchedule[index] = {
					dayOfWeek: exemption.dayOfWeek!,
					index: exemption.index!,
					room: exemption.room!,
					lesson: exemption.lesson!,
					with: isTeacher ? "Klasa " + exemption.class!.name : exemption.teacher!.name,
					exemption: {
						isExemption: true,
						cancelation: false,
						reason: exemption.reason,
					},
				};
				break;
			case "cancelation": {
				const index = schedule.findIndex((lesson) => lesson.id == exemption.scheduleId);
				finalSchedule[index]!.exemption.cancelation = true;
				finalSchedule[index]!.exemption.isExemption = true;
				finalSchedule[index]!.exemption.reason = exemption.reason;
				break;
			}
		}
	});

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
