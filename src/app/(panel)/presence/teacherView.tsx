"use client";
import { Transition } from "@headlessui/react";
import { ExclamationTriangleIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "~/components/ui/button";
import { calculateWeekDates, days, type ISchedule, schoolHours, stringToHslColor } from "~/util/scheduleUtil";
import { PresenceDrawer } from "./drawer";
import { type PresenceStatus } from "./view";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";

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
	const [selectedLessonIds, setSelectedLessonIds] = useState<{
		scheduleId: number | null;
		exemptionId: number | null;
	}>({
		scheduleId: null,
		exemptionId: null,
	});
	const [changes, setChanges] = useState<StatusChange[]>([]);
	const [isUpdating, setIsUpdating] = useState(false);

	const presenceSnapshot = useRef<ClassPresence[]>(presenceInit);
	const wasListenerAdded = useRef(false);

	const selectedPresence = presence.find(
		(presence) =>
			(presence.scheduleId !== null && presence.scheduleId === selectedLessonIds.scheduleId) ||
			(presence.exemptionId !== null && presence.exemptionId === selectedLessonIds.exemptionId),
	)!;

	const maxIndex = Math.max(...schedule.map((lesson) => lesson.index));
	const { prev, next, dates, week } = calculateWeekDates(weekDate);

	useEffect(() => {
		presenceSnapshot.current = structuredClone(presenceInit);

		window.addEventListener("keydown", (e) => {
			if (e.key === "Escape") setSelectedLessonIds({ scheduleId: null, exemptionId: null });
		});

		return () =>
			window.removeEventListener("keydown", (e) => {
				if (e.key === "Escape") setSelectedLessonIds({ scheduleId: null, exemptionId: null });
			});
	}, []);

	useEffect(() => {
		if (changes.length === 0 && wasListenerAdded.current) {
			window.removeEventListener("beforeunload", (e) => {
				e.preventDefault();
			});

			wasListenerAdded.current = false;
		} else if (!wasListenerAdded.current) {
			window.addEventListener("beforeunload", (e) => {
				e.preventDefault();
			});

			wasListenerAdded.current = true;
		}
	}, [changes]);

	const saveChanges = async () => {
		setIsUpdating(true);
		if (isUpdating || changes.length === 0) return;

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
			changes.forEach((change) => {
				//update the snapshot
				const snapshot = presenceSnapshot.current.find(
					(lesson) =>
						(lesson.scheduleId === change.scheduleId || lesson.exemptionId === change.exemptionId) &&
						lesson.students[change.studentId],
				);

				if (snapshot) {
					snapshot.students[change.studentId]!.status = change.status;
				}
			});

			toast("Zmiany zapisano pomyślnie.", {
				type: "success",
			});
			setChanges([]);
			setIsUpdating(false);
		} else {
			toast("Wystąpił błąd podczas zapisywania zmian. Spróbuj ponownie później.", {
				type: "error",
			});
		}
	};

	return (
		<>
			<div className="flex w-full flex-col rounded-lg">
				<div className="flex items-end justify-between py-4">
					<div className="flex flex-col gap-1">
						<h2 className={`mb-1" border-l-4 border-accent pl-2 text-2xl font-bold`}>Obecności dla klasy {className}</h2>
						<p className="mb-2 text-text/80">Obecności na tydzień od {dates[0]} do {dates[4]}</p>
					</div>
					<div className="flex items-center gap-2">
						<Link href={`/presence?week=${prev}`}>
							<Button>
								<ChevronLeftIcon className="h-5 w-5" />
								Poprzedni tydzień
							</Button>
						</Link>

						<Link href={`/presence?week=${next}`}>
							<Button>
								Następny tydzień
								<ChevronRightIcon className="h-5 w-5" />
							</Button>
						</Link>
					</div>
				</div>
				<table className="h-[1px] w-full table-fixed">
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
							<tr key={index} className={index % 2 == 1 ? "h-full" : "h-full bg-secondary/20"}>
								<td className="p-4 align-middle">
									{hour.from} - {hour.to}
								</td>
								{[0, 1, 2, 3, 4].map((day) => {
									const lesson = schedule.find((pLesson) => pLesson.index === index && pLesson.dayOfWeek === day);

									if (lesson) {
										return (
											<td className="p-1.5 px-1 align-middle" key={day}>
												<button
													className={`relative h-full w-full rounded-lg p-2 text-left transition-all`}
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
				<div className="fixed bottom-0 right-0 flex w-full justify-between rounded-t-lg border-b-4 border-accent/80 bg-white p-4">
					<h3 className="inline-flex items-center gap-2 text-xl">
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20">
							<ExclamationTriangleIcon className="h-6 w-6 stroke-accent/80" />
						</div>
						Masz niezapisane zmiany!
					</h3>
					<Button
						loading={isUpdating}
						disabled={isUpdating}
						className="rounded-lg bg-primary px-4 py-2 text-text disabled:cursor-not-allowed disabled:opacity-50"
						onClick={saveChanges}
					>
						Zapisz zmiany
					</Button>
				</div>
			</Transition>

			<PresenceDrawer
				isUpdating={isUpdating}
				presence={selectedPresence}
				close={() => setSelectedLessonIds({ scheduleId: -1, exemptionId: -1 })}
				onSave={saveChanges}
				onStatusChange={(statusChange) => {
					const changesCopy = [...changes];
					const changeIndex = changesCopy.findIndex(
						(change) =>
							(change.scheduleId === selectedPresence.scheduleId || change.scheduleId === selectedPresence.exemptionId) &&
							change.studentId === statusChange.studentId,
					);

					const snapshot = presenceSnapshot.current.find(
						(lesson) =>
							lesson.scheduleId === selectedPresence.scheduleId || lesson.exemptionId === selectedPresence.exemptionId,
					);

					if (snapshot && snapshot.students[statusChange.studentId]!.status === statusChange.status) {
						if (changeIndex !== -1) changesCopy.splice(changeIndex, 1);
					} else {
						if (changeIndex !== -1) {
							changesCopy[changeIndex] = statusChange;
						} else {
							changesCopy.push(statusChange);
						}
					}

					const presenceCopy = [...presence];
					const presenceIndex = presenceCopy.findIndex(
						(presence) =>
							presence.scheduleId === selectedPresence.scheduleId && presence.exemptionId === selectedPresence.exemptionId,
					);

					if (presenceIndex !== -1) {
						presenceCopy[presenceIndex]!.students[statusChange.studentId]!.status = statusChange.status;
					}

					setPresence(presenceCopy);
					setChanges(changesCopy);
				}}
			/>
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
