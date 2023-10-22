"use client";
import { ExclamationTriangleIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { type ISchedule, calculateWeekDates, stringToHslColor } from "~/util/scheduleUtil";
import { days, schoolHours } from "../schedule/view";
import { PresenceDrawer } from "./drawer";
import { type PresenceStatus } from "./view";
import { Portal, Transition } from "@headlessui/react";

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
	const [changes, setChanges] = useState<StatusChange[]>([]);
	const [isUpdating, setIsUpdating] = useState(false);

	const selectedPresence = presence.find(
		(presence) =>
			(presence.scheduleId !== -1 && presence.scheduleId === selectedLessonIds.scheduleId) ||
			(presence.exemptionId !== -1 && presence.exemptionId === selectedLessonIds.exemptionId),
	)!;

	console.log("changes", changes);
	const maxIndex = Math.max(...schedule.map((lesson) => lesson.index));
	const { prev, next, dates, week } = calculateWeekDates(weekDate);

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

			<Transition
				as={Fragment}
				show={changes.length > 0 || isUpdating}
				enter="transition ease-out duration-100"
				enterFrom="opacity-0"
				enterTo="opacity-100"
				leave="transition ease-in duration-75"
				leaveFrom="opacity-100"
				leaveTo="opacity-0"
			>
				<div className="fixed bottom-0 right-0 flex w-full justify-between rounded-t-lg border-b-4 border-primary bg-white p-4">
					<h3 className="inline-flex items-center gap-2 text-xl">
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20">
							<ExclamationTriangleIcon className="h-6 w-6 stroke-accent/80" />
						</div>
						Masz niezapisane zmiany!
					</h3>
					<button
						className="rounded-lg bg-primary px-4 py-2 text-text"
						onClick={async () => {
							const res = await fetch("/presence/api/update", {
								method: "PUT",
								body: JSON.stringify(
									changes.map((change) => ({
										...change,
										date: week,
									})),
								),
							});

							if (res.ok) {
								setChanges([]);
								setIsUpdating(false);
							} else {
								alert("Wystąpił błąd podczas zapisywania zmian. Spróbuj ponownie później.");
							}
						}}
					>
						Zapisz zmiany
					</button>
				</div>
			</Transition>

			{selectedPresence && (
				<Portal>
					<PresenceDrawer
						presence={selectedPresence}
						close={() => setSelectedLessonIds({ scheduleId: -1, exemptionId: -1 })}
						onStatusChange={(statusChange) => {
							const changesCopy = [...changes];
							console.log("changesCopy", changesCopy);
							const changeIndex = changesCopy.findIndex(
								(change) =>
									(change.scheduleId === selectedPresence.scheduleId ||
										change.scheduleId === selectedPresence.exemptionId) &&
									change.studentId === statusChange.studentId,
							);

							console.log("changeIndex", changeIndex);
							if (changeIndex !== -1) {
								changesCopy[changeIndex]!.status = statusChange.status;
							} else {
								changesCopy.push({
									...statusChange,
								});
							}

							setChanges(changesCopy);
							setPresence(
								[...presence].map((lesson) => {
									if (
										lesson.scheduleId === selectedPresence.scheduleId ||
										lesson.exemptionId === selectedPresence.exemptionId
									) {
										lesson.students[statusChange.studentId]!.status = statusChange.status;
									}

									return lesson;
								}),
							);
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

export interface StatusChange {
	studentId: number;
	scheduleId: number | null;
	exemptionId: number | null;
	status: PresenceStatus;
}
