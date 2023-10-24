import dayjs from "dayjs";
import { type PresenceStatus } from "~/app/(panel)/presence/view";
import { type Exemptions, type Presence } from "~/server/db/schema";

export const schoolHours = [
	{ from: "7:30", to: "8:15" },
	{ from: "8:20", to: "9:05" },
	{ from: "9:10", to: "9:55" },
	{ from: "10:00", to: "10:45" },
	{ from: "10:50", to: "11:35" },
	{ from: "11:40", to: "12:25" },
	{ from: "12:30", to: "13:15" },
	{ from: "13:20", to: "14:05" },
	{ from: "14:10", to: "14:55" },
	{ from: "15:00", to: "15:45" },
	{ from: "15:50", to: "16:35" },
	{ from: "16:40", to: "17:25" },
	{ from: "17:30", to: "18:15" },
	{ from: "18:20", to: "19:05" },
	{ from: "19:10", to: "19:55" },
];

export const days = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek"];

export function mapWithPresence(schedule: IPresence[], exemptions: IExemption[], presence: (typeof Presence.$inferSelect)[]): IPresence[] {
	exemptions.forEach((exemption) => {
		switch (exemption.type) {
			case "addition":
				schedule.push({
					id: -1,
					dayOfWeek: exemption.dayOfWeek!,
					index: exemption.index!,
					room: exemption.room!,
					lesson: exemption.lesson!,
					with: exemption.teacher!.name,
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

				schedule[index] = {
					id: schedule[index]!.id,
					dayOfWeek: exemption.dayOfWeek ?? schedule[index]!.dayOfWeek,
					index: exemption.index ?? schedule[index]!.index,
					room: exemption.room ?? schedule[index]!.room,
					lesson: exemption.lesson ?? schedule[index]!.lesson,
					with: exemption.teacher!.name ?? schedule[index]!.with,
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
				schedule[index]!.exemption.cancelation = true;
				schedule[index]!.exemption.isExemption = true;
				schedule[index]!.exemption.reason = exemption.reason;
				schedule[index]!.status = "released";
				break;
			}
		}
	});

	presence.forEach((presence) => {
		const index = schedule.findIndex((lesson) => lesson.id === presence.tableId || lesson.exemption.id === presence.exemptionId);

		if (index != -1) {
			schedule[index]!.status = presence.status;
		}
	});

	return schedule;
}

export function mapWithExceptions(schedule: ISchedule[], exemptions: IExemption[], isTeacher: boolean): ISchedule[] {
	exemptions.forEach((exemption) => {
		switch (exemption.type) {
			case "addition":
				schedule.push({
					id: -1, // Ids are not used in views, only for easier exemptions mapping
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
				});
				break;
			case "change":
				const index = schedule.findIndex((lesson) => lesson.id == exemption.scheduleId);

				schedule[index] = {
					id: schedule[index]!.id,
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
				};
				break;
			case "cancelation": {
				const index = schedule.findIndex((lesson) => lesson.id == exemption.scheduleId);
				schedule[index]!.exemption = {
					id: exemption.id,
					isExemption: true,
					cancelation: true,
					reason: exemption.reason,
				};

				break;
			}
		}
	});

	return schedule;
}

export function stringToHslColor(str: string, s: number, l: number) {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}

	const h = hash % 360;
	return "hsl(" + h + ", " + s + "%, " + l + "%)";
}

export function calculateBlockHeight(from: number, to: number) {
	const size = to - from + 1;
	return 72 * size - 4 + (size - 1) * 11.5; // 72px is the height of one row, 4px is the padding, 11.5px is the margin
}

export function calculateWeekDates(weekDate?: string) {
	const dateFormat = Intl.DateTimeFormat("pl-PL", { month: "long", day: "numeric" });
	const date = weekDate ? dayjs(weekDate) : dayjs();

	const monday = date.day(1);
	const prev = monday.subtract(7, "day").format("YYYY-MM-DD");
	const next = monday.add(7, "day").format("YYYY-MM-DD");

	return {
		week: monday.set("hour", 0).set("minute", 0).set("second", 0).set("millisecond", 0).toDate(),
		prev: prev,
		next: next,
		dates: [1, 2, 3, 4, 5].map((day) => dateFormat.format(monday.add(day - 1, "day").toDate())),
	};
}

type IExemption = typeof Exemptions.$inferSelect & {
	teacher: {
		name: string;
	} | null;
	lesson: {
		name: string;
		id: number;
	} | null;
	class: {
		name: string;
	} | null;
};

export interface ISchedule {
	id: number;
	dayOfWeek: number;
	index: number;
	room: string;
	lesson: {
		id: number;
		name: string | null;
	};
	with: string;
	exemption: {
		id: number;
		isExemption: boolean;
		cancelation: boolean;
		reason: string | null;
	};
}

export interface IPresence extends ISchedule {
	status: PresenceStatus;
}
