export const runtime = "edge";
import { currentUser } from "@clerk/nextjs";
import { cookies } from "next/headers";
import { db } from "~/server/db";
import { getWeekDates } from "../schedule/page";
import PresenceView, { type IPresence } from "./view";

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

	// Yes this code repats, but it has some differences
	exemptions.forEach((exemption) => {
		switch (exemption.type) {
			case "addition":
				finalSchedule.push({
					id: -1,
					dayOfWeek: exemption.dayOfWeek!,
					index: exemption.index!,
					room: exemption.room!,
					lesson: exemption.lesson!,
					with: isTeacher ? "Klasa " + exemption.class!.name : exemption.teacher!.name,
					exemption: {
						id: exemption.id,
						isExemption: true,
						cancelation: false,
						reason: exemption.reason,
					},
					status: "none",
				});
				break;
			case "change":
				const index = schedule.findIndex((lesson) => lesson.id == exemption.scheduleId);

				finalSchedule[index] = {
					id: finalSchedule[index]!.id,
					dayOfWeek: exemption.dayOfWeek ?? finalSchedule[index]!.dayOfWeek,
					index: exemption.index ?? finalSchedule[index]!.index,
					room: exemption.room ?? finalSchedule[index]!.room,
					lesson: exemption.lesson ?? finalSchedule[index]!.lesson,
					with: isTeacher ? "Klasa " + exemption.class!.name : exemption.teacher!.name,
					exemption: {
						id: exemption.id,
						isExemption: true,
						cancelation: false,
						reason: exemption.reason,
					},
					status: "none",
				};
				break;
			case "cancelation": {
				const index = schedule.findIndex((lesson) => lesson.id == exemption.scheduleId);
				finalSchedule[index]!.exemption.cancelation = true;
				finalSchedule[index]!.exemption.isExemption = true;
				finalSchedule[index]!.exemption.reason = exemption.reason;
				finalSchedule[index]!.status = "released";
				break;
			}
		}
	});

	presence.forEach((presence) => {
		const index = finalSchedule.findIndex((lesson) => lesson.id === presence.tableId || lesson.exemption.id === presence.exemptionId);

		if (index != -1) {
			finalSchedule[index]!.status = presence.status;
		}
	});

	return <PresenceView presence={finalSchedule} weekDate={searchParams.week} />;
}

// const getAttendenceForClass = async (classId: number) => {
// 	const presence = await db.presence.findMany({});
// }

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
