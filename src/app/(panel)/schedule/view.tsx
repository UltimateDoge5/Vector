import { InformationCircleIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import Link from "next/link";

export const hours = [
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

export function ScheduleView({ schedule, title, weekDate }: { schedule: ISchedule[]; title: string; weekDate?: string }) {
	const maxIndex = Math.max(...schedule.map((lesson) => lesson.index));

	const blocks: Block[] = [];
	// If there are two or more same lessons in a row, merge them
	schedule.forEach((lesson) => {
		// Check for block with the same lesson
		const block = blocks.find(
			(block) =>
				block.lesson.id === lesson.lesson.id &&
				block.with === lesson.with &&
				block.room === lesson.room &&
				block.exemption.cancelation === false,
		);

		if (block && lesson.exemption.cancelation === false) {
			block.from = Math.min(block.from, lesson.index);
			block.to = Math.max(block.to, lesson.index);
		} else {
			blocks.push({
				...lesson,
				from: lesson.index,
				to: lesson.index,
			});
		}
	});

	const { prev, next, dates } = calculateWeekDates(weekDate);

	return (
		<div className="flex w-full flex-col items-center justify-center rounded-lg">
			<div className="mb-2 flex w-full justify-evenly">
				<Link className="rounded bg-primary px-4 py-2" href={`/schedule?week=${prev}`}>
					Poprzedni tydzień
				</Link>
				<h2 className="text-2xl">{title}</h2>
				<Link className="rounded bg-primary px-4 py-2" href={`/schedule?week=${next}`}>
					Następny tydzień
				</Link>
			</div>
			<table className="w-full table-fixed">
				<colgroup>
					<col className="w-36" />
				</colgroup>
				<tbody className="[&_tr:last-child]:border-0">
					<tr>
						<th className="h-12 w-1/6 px-4 align-middle font-medium">Lekcja</th>
						{days.map((day, i) => (
							<th key={day} className="h-12 px-4 text-center align-middle font-medium">
								{day}
								<br />
								<p className="font-light">{dates[i]}</p>
							</th>
						))}
					</tr>
					{hours.slice(0, maxIndex + 2).map((hour, index) => (
						<tr key={index} className={index % 2 == 1 ? "" : "bg-secondary/20"}>
							<td className="p-4 align-middle">
								{hour.from} - {hour.to}
							</td>
							{[0, 1, 2, 3, 4].map((day) => {
								const block = blocks.find(
									(pBlock) => pBlock.from <= index && pBlock.to >= index && pBlock.dayOfWeek === day,
								);

								if (!block) return <td key={day} />;

								if (block.from === index) {
									return (
										<td rowSpan={block.to - block.from + 1} className="p-1.5 align-middle" key={day}>
											<div
												className={`relative h-max rounded-lg p-2 transition-all  ${
													block.exemption.cancelation ? "line-through grayscale" : "hover:saturate-150"
												}`}
												style={{
													background: stringToHslColor(block.lesson.name!, 80, 80),
													height: `${calculateBlockHeight(block.from, block.to)}px`,
												}}
											>
												<h3>{block.lesson.name}</h3>
												<p className="text-sm font-light">
													{block.with} | sala {block.room}
												</p>
												{block.exemption.isExemption && (
													<div className="absolute right-2 top-2 inline-block text-left">
														<InformationCircleIcon className="peer h-4 w-4 cursor-help" />
														<div className="pointer-events-none absolute top-full z-10 w-max max-w-md rounded-md bg-white p-2 text-sm text-black opacity-0 shadow transition-all peer-hover:pointer-events-auto peer-hover:opacity-100">
															{/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing*/}
															{block.exemption.reason || "Nie podano powodu zastępstwa"}
														</div>
													</div>
												)}
											</div>
										</td>
									);
								}
								return;
							})}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function stringToHslColor(str: string, s: number, l: number) {
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
		prev: prev,
		next: next,
		dates: [1, 2, 3, 4, 5].map((day) => dateFormat.format(monday.add(day - 1, "day").toDate())),
	};
}

export interface ISchedule {
	dayOfWeek: number;
	index: number;
	room: string;
	lesson: {
		id: number;
		name: string | null;
	};
	with: string;
	exemption: {
		isExemption: boolean;
		cancelation: boolean;
		reason: string | null;
	};
}

interface Block extends ISchedule {
	from: number;
	to: number;
}
