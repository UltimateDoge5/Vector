"use client";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { days, schoolHours, type ISchedule } from "../schedule/view";
import { type PresenceStatus } from "./view";
import { useReducer, useState } from "react";
import { PresenceDrawer } from "./drawer";
import { calculateWeekDates, stringToHslColor } from "~/util/scheduleUtil";

export function TeacherPresenceView({
	schedule,
	weekDate,
	presenceInit,
}: {
	schedule: ISchedule[];
	presenceInit: ClassPresence;
	weekDate?: string;
}) {
	const [presence, setPresence] = useReducer((prev: ClassPresence, next: ClassPresence) => ({ ...prev, ...next }), presenceInit);
	const [drawerOpen, setDrawerOpen] = useState(false);

	const maxIndex = Math.max(...schedule.map((lesson) => lesson.index));
	const { prev, next, dates } = calculateWeekDates(weekDate);

	return (
		<>
			<div className="flex w-full flex-col items-center justify-center rounded-lg">
				<div className="mb-2 flex w-full justify-evenly">
					<Link className="rounded bg-primary px-4 py-2" href={`/presence?week=${prev}`}>
						Poprzedni tydzień
					</Link>
					<h2 className="text-2xl">Obecności</h2>
					<Link className="rounded bg-primary px-4 py-2" href={`/presence?week=${next}`}>
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
						{schoolHours.slice(0, maxIndex + 2).map((hour, index) => (
							<tr key={index} className={index % 2 == 1 ? "" : "bg-secondary/20"}>
								<td className="p-4 align-middle">
									{hour.from} - {hour.to}
								</td>
								{[0, 1, 2, 3, 4].map((day) => {
									const lesson = schedule.find((pLesson) => pLesson.index === index && pLesson.dayOfWeek === day);

									if (lesson) {
										return (
											<td className="p-1.5 align-middle" key={day}>
												<div
													className={`relative h-max rounded-lg p-2 transition-all`}
													style={{
														background: stringToHslColor(lesson.lesson.name!, 80, 80),
													}}
												>
													<h3>{lesson.lesson.name}</h3>
													<p className="text-sm font-light">
														{lesson.with} | sala {lesson.room}
													</p>
													{lesson.exemption.isExemption && (
														<div className="absolute right-2 top-2 inline-block text-left">
															<InformationCircleIcon className="peer h-4 w-4 cursor-help" />
															<div className="pointer-events-none absolute top-full z-10 w-max max-w-md rounded-md bg-white p-2 text-sm text-black opacity-0 shadow transition-all peer-hover:pointer-events-auto peer-hover:opacity-100">
																{/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing*/}
																{lesson.exemption.reason || "Nie podano powodu zastępstwa"}
															</div>
														</div>
													)}
												</div>
											</td>
										);
									}

									return <td key={day} />;
								})}
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<PresenceDrawer presence={presence} setPresence={setPresence} isOpen={drawerOpen} setOpen={setDrawerOpen} />
		</>
	);
}

export type ClassPresence = Record<
	number,
	{
		lessonName: string;
		teacherName: string;
		hours: (typeof schoolHours)[number];
		students: Record<string, PresenceStatus>;
	}
>;
