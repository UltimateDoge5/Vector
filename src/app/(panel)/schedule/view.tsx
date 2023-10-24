"use client";
import { ChevronLeftIcon, ChevronRightIcon, PencilSquareIcon } from "@heroicons/react/20/solid";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import Link from "next/link";
import { useState } from "react";
import { calculateBlockHeight, calculateWeekDates, days, schoolHours, stringToHslColor, type ISchedule } from "~/util/scheduleUtil";

export function ScheduleView({ schedule, title, weekDate }: { schedule: ISchedule[]; title: string; weekDate?: string }) {
	const maxIndex = Math.max(...schedule.map((lesson) => lesson.index));

	const [dissmisedLessons, setDissmisedLessons] = useState<Dismissal[]>([]);
	const [isDismissionMode, setIsDismissionMode] = useState(false);
	const [loading, setLoading] = useState(false);

	const sendDismissals = async () => {
		setLoading(true);
		const res = await fetch("/api/dismissals", {
			method: "POST",
			body: JSON.stringify({
				dismissals: dissmisedLessons,
				date: dayjs(weekDate).set("hour", 0).set("minute", 0).set("second", 0).format("YYYY-MM-DD"),
			}),
		});

		setLoading(false);

		if (!res.ok) {
			alert("Wystąpił błąd podczas wysyłania zwolnień");
			return;
		}

		setIsDismissionMode(false);
		setDissmisedLessons([]);
	};

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

		if (block && lesson.exemption.cancelation === false && !isDismissionMode) {
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
		<>
			<div className="flex w-full flex-col rounded-lg">
				<h2 className="mb-3 border-l-4 border-accent pl-2 text-2xl font-bold">{title}</h2>
				<div className="mb-2 flex w-full justify-between border-b pb-2">
					<div className="flex items-center gap-2">
						<button
							className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-text"
							disabled={loading}
							onClick={async () => {
								if (isDismissionMode && dissmisedLessons.length > 0) {
									await sendDismissals();
								} else {
									setIsDismissionMode((prev) => !prev);
								}
							}}
						>
							<PencilSquareIcon className="h-5 w-5" />
							{dissmisedLessons.length > 0 ? "Wyślij zwolnienia" : isDismissionMode ? "Anuluj" : "Edytuj zwolnienia"}
						</button>

						{dissmisedLessons.length > 0 && <span>{dissmisedLessons.length} zastępstw do wysłania</span>}
					</div>
					<div className="flex items-center gap-2">
						<Link className="flex items-center rounded-lg bg-primary px-4 py-2" href={`/schedule?week=${prev}`}>
							<ChevronLeftIcon className="h-5 w-5" />
							Poprzedni tydzień
						</Link>

						<Link className="flex items-center rounded-lg bg-primary px-4 py-2" href={`/schedule?week=${next}`}>
							Następny tydzień
							<ChevronRightIcon className="h-5 w-5" />
						</Link>
					</div>
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
									const block = blocks.find(
										(pBlock) => pBlock.from <= index && pBlock.to >= index && pBlock.dayOfWeek === day,
									);

									if (!block) return <td key={day} />;

									const isDissmised = dissmisedLessons.some(
										(dissmisal) => dissmisal.scheduleId === block.id && dissmisal.exceptionId === block.exemption.id,
									);

									if (block.from === index) {
										return (
											<td rowSpan={block.to - block.from + 1} className="p-1.5 align-middle" key={day}>
												<div
													className={`relative h-max rounded-lg p-2 transition-all
												  ${block.exemption.cancelation ? "line-through grayscale" : "hover:saturate-150"}
												  ${isDismissionMode ? "cursor-pointer" : ""}
												  ${isDissmised ? "grayscale" : ""}`}
													style={{
														background: stringToHslColor(block.lesson.name!, 80, 80),
														minHeight: `${calculateBlockHeight(block.from, block.to)}px`,
													}}
													onClick={() => {
														if (!isDismissionMode) return;

														// If block is 1 in height
														if (block.from === block.to) {
															const dissmisal = dissmisedLessons.find(
																(dissmisal) => dissmisal.scheduleId === block.id,
															);

															// TODO: check if its already past the lesson time
															if (dissmisal) {
																setDissmisedLessons(
																	dissmisedLessons.filter(
																		(dissmisal) => dissmisal.scheduleId !== block.id,
																	),
																);
															} else {
																setDissmisedLessons([
																	...dissmisedLessons,
																	{ scheduleId: block.id, exceptionId: block.exemption.id },
																]);
															}
														} else {
															// Ask if user wants to dismiss all lessons in block
														}
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
		</>
	);
}

interface Dismissal {
	scheduleId: number;
	exceptionId: number;
}

interface Block extends ISchedule {
	from: number;
	to: number;
}
