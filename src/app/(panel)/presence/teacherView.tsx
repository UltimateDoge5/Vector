"use client";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useEffect, useState } from "react";
import { type ISchedule, calculateWeekDates, stringToHslColor } from "~/util/scheduleUtil";
import { days, schoolHours } from "../schedule/view";
import { PresenceDrawer } from "./drawer";
import { type PresenceStatus } from "./view";
import { Portal } from "@headlessui/react";

export function TeacherPresenceView({
	schedule,
	weekDate,
	presenceInit,
	className,
}: {
	schedule: ISchedule[];
	presenceInit: ClassPresence[];
	weekDate?: string;
	className?: string;
}) {
	const [presence, setPresence] = useState<ClassPresence[]>(presenceInit);
	const [selectedLessonIds, setSelectedLessonIds] = useState({
		scheduleId: -1,
		exemptionId: -1,
	});

	const selectedPresence = presence.find(
		(presence) =>
			(presence.scheduleId !== -1 && presence.scheduleId === selectedLessonIds.scheduleId) ||
			(presence.exemptionId !== -1 && presence.exemptionId === selectedLessonIds.exemptionId),
	)!;

	const maxIndex = Math.max(...schedule.map((lesson) => lesson.index));
	const { prev, next, dates } = calculateWeekDates(weekDate);

	useEffect(() => {
		window.addEventListener("keydown", (e) => {
			if (e.key === "Escape") setSelectedLessonIds({ scheduleId: -1, exemptionId: -1 });
		});

		return () =>
			window.removeEventListener("keydown", (e) => {
				if (e.key === "Escape") setSelectedLessonIds({ scheduleId: -1, exemptionId: -1 });
			});
	}, []);

	return (
		<>
			<div className="flex w-full flex-col items-center justify-center rounded-lg">
				<div className="mb-2 flex w-full justify-evenly">
					<Link className="rounded bg-primary px-4 py-2" href={`/presence?week=${prev}`}>
						Poprzedni tydzień
					</Link>
					<h2 className="text-2xl">Obecności dla klasy {className}</h2>
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
												<button
													className={`relative h-max w-full rounded-lg p-2 text-left transition-all`}
													style={{
														background: stringToHslColor(lesson.lesson.name!, 80, 80),
													}}
													onClick={() =>
														setSelectedLessonIds({
															scheduleId: lesson.id,
															exemptionId: lesson.exemption.id,
														})
													}
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
												</button>
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
			{selectedPresence && (
				<Portal>
					<PresenceDrawer
						presence={selectedPresence}
						setPresence={(v) => {
							setPresence(presence.map((p) => (p.scheduleId === v.scheduleId ? v : p)));
						}}
					/>
				</Portal>
			)}
		</>
	);
}

export interface ClassPresence {
	scheduleId: number | null;
	exemptionId: number | null;
	lessonName: string;
	teacherName: string;
	hours: (typeof schoolHours)[number];
	students: Record<number, { status: PresenceStatus; name: string }>;
}
