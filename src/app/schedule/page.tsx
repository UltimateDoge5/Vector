import { currentUser } from "@clerk/nextjs";
import { ScheduleView } from "~/app/schedule/view";
import { db } from "~/server/db";

export const runtime = "edge";

export default async function SchedulePage({
	searchParams,
}: {
	searchParams: { week: string };
}) {
	const user = await currentUser();

	const week: {
		from?: Date;
		to?: Date;
	} = {};

	//check if the week date is a first day of the week
	const date = searchParams.week ? new Date(searchParams.week) : new Date();
	const day = date.getDay();
	const diff = date.getDate() - day + (day == 0 ? -6 : 1);
	console.log(diff, day);

	week.from = new Date(date.setDate(diff));
	week.from.setHours(0, 0, 0);
	week.to = new Date(date.setDate(diff + 6));
	week.to.setHours(0, 0, 0);

	const schedule = (
		await db.query.Schedule.findMany({
			with: {
				class: {
					with: {
						students: {
							where: (student, { eq }) =>
								eq(student.userId, user!.id),
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
		})
	).map((schedule) => ({
		id: schedule.id,
		dayOfWeek: schedule.dayOfWeek,
		index: schedule.index,
		room: schedule.room,
		lesson: schedule.lesson,
		teacher: schedule.teacher,
	}));

	const exemptions = await db.query.Exemptions.findMany({
		where: (exemption, { and, lte, gte }) =>
			and(gte(exemption.date, week.from!), lte(exemption.date, week.to!)),
	});

	// tableId === null && json !== null => add to schedule
	// tableId !== null && json !== null => override schedule
	// tableId !== null && json === null => remove from schedule
	const idsToRemove: number[] = [];

	exemptions.forEach((exemption) => {
		const lesson = schedule.find(
			(lesson) => lesson.id === exemption.tableId,
		);

		// add to schedule
		if (!lesson) {
			schedule.push({
				id: -1,
				dayOfWeek: exemption.schedule!.dayOfWeek,
				index: exemption.schedule!.index,
				room: exemption.schedule!.room,
				lesson: exemption.schedule!.lesson,
				teacher: {
					name: exemption.schedule!.teacherName,
				},
			});
			return;
		}

		// override schedule
		if (exemption.schedule !== null) {
			const newLesson = {
				id: lesson.id,
				dayOfWeek: exemption.date.getDay(),
				index: exemption.schedule.index,
				room: exemption.schedule.room,
				lesson: exemption.schedule.lesson,
				teacher: {
					name: exemption.schedule.teacherName,
				},
			};

			const index = schedule.indexOf(lesson);
			schedule[index] = newLesson;
			return;
		}

		// remove from schedule
		idsToRemove.push(lesson.id);
	});

	for (const id of idsToRemove) {
		const index = schedule.findIndex((lesson) => lesson.id === id);
		schedule.splice(index, 1);
	}

	return <ScheduleView schedule={schedule} />;
}
