"use client";
import { ChevronLeftIcon, ChevronRightIcon, PencilSquareIcon } from "@heroicons/react/20/solid";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "~/components/ui/button";
import { type Presence } from "~/server/db/schema";

import { calculateWeekDates, days, schoolHours, type IPresence } from "~/util/scheduleUtil";

export type PresenceStatus = (typeof Presence.$inferSelect)["status"] | "none";

interface Block extends IPresence {
	from: number;
	to: number;
}

export const PresenceLegend = {
	none: { color: "bg-gray-400", text: "Brak" },
	present: { color: "bg-green-400", text: "Obecny" },
	absent: { color: "bg-red-400", text: "Nieobecny" },
	late: { color: "bg-yellow-400", text: "Spóźniony" },
	excused: { color: "bg-emerald-300", text: "Usprawiedliwiony" },
	released: { color: "bg-blue-400", text: "Zwolniony" },
	releasedBySchool: { color: "bg-purple-400", text: "Zwolniony przez szkołę" },
} satisfies Record<
	PresenceStatus,
	{
		color: string;
		text: string;
	}
>;

export function PresenceView({ presence: presenceInit, weekDate }: { presence: IPresence[]; weekDate?: string }) {
	const maxIndex = Math.max(...presenceInit.map((lesson) => lesson.index));

	const [presence, setPresence] = useState<IPresence[]>(presenceInit);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		setPresence(presenceInit);
	}, [presenceInit]);

	const excuseLessons = async (excuses: ReturnType<typeof getLessonsToExcuse>) => {
		setLoading(true);
		const res = await fetch("/presence/api/excuse", {
			method: "PUT",
			body: JSON.stringify({
				excuses,
				date: dayjs(weekDate).day(1).format("YYYY-MM-DD"),
			}),
		});

		setLoading(false);

		if (!res.ok) {
			toast("Wystąpił błąd podczas wysyłania usprawiedliwień", {
				type: "error",
			});
			return;
		}

		const newPresence = [...presence];

		excuses.forEach((excuse) => {
			const presence = newPresence.find((p) => p.id === excuse.scheduleId && p.exemption.id === excuse.exemptionId);

			if (presence) {
				presence.status = "excused";
			}
		});

		toast("Usprawiedliwiono nieobecności", {
			type: "success",
		});
		setPresence(newPresence);
	};

	const blocks: Block[] = [];
	// If there are two or more same lessons in a row, merge them
	presence.forEach((presence) => {
		// Check for block with the same lesson
		const block = blocks.find(
			(block) =>
				block.lesson.id === presence.lesson.id &&
				block.with === presence.with &&
				block.room === presence.room &&
				block.exemption.cancelation === false &&
				block.status === presence.status,
		);

		if (block && presence.exemption.cancelation === false && presence.status === block.status) {
			block.from = Math.min(block.from, presence.index);
			block.to = Math.max(block.to, presence.index);
		} else {
			blocks.push({
				...presence,
				from: presence.index,
				to: presence.index,
			});
		}
	});

	const { prev, next, dates } = calculateWeekDates(weekDate);
	const lessonsToExcuse = getLessonsToExcuse(presence);

	return (
		<div className="flex w-full flex-col rounded-lg">
			<h2 className="mb-3 border-l-4 border-accent pl-2 text-2xl font-bold">Obecności</h2>
			<div className="mb-2 flex w-full justify-between border-b pb-2">
				<div className="flex items-center gap-2">
					<Button
						loading={loading}
						disabled={lessonsToExcuse.length === 0}
						onClick={() => excuseLessons(lessonsToExcuse)}
						icon={<PencilSquareIcon className="h-5 w-5" />}
					>
						Usprawiedliw nieobecnośći
					</Button>
				</div>
				<div className="flex items-center gap-2">
					<Link className="flex items-center rounded-lg bg-primary px-4 py-2" href={`/presence?week=${prev}`}>
						<ChevronLeftIcon className="h-5 w-5" />
						Poprzedni tydzień
					</Link>

					<Link className="flex items-center rounded-lg bg-primary px-4 py-2" href={`/presence?week=${next}`}>
						Następny tydzień
						<ChevronRightIcon className="h-5 w-5" />
					</Link>
				</div>
			</div>

			<div className="mb-2 flex justify-center gap-8 border-b pb-2">
				{Object.entries(PresenceLegend).map(([key, value]) => (
					<div key={key} className="flex items-center gap-2">
						<div className={`h-5 w-5 rounded-md ${value.color}`} />
						<p className="text-lg">{value.text}</p>
					</div>
				))}
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
								const block = blocks.find(
									(pBlock) => pBlock.from <= index && pBlock.to >= index && pBlock.dayOfWeek === day,
								);

								if (!block) return <td key={day} />;

								if (block.from === index) {
									return (
										<td rowSpan={block.to - block.from + 1} className="p-1.5 px-1 align-middle" key={day}>
											<div
												className={`relative h-full rounded-lg p-2 transition-all ${
													PresenceLegend[block.status].color
												} ${block.exemption.cancelation ? "line-through" : "hover:saturate-150"}`}
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

const getLessonsToExcuse = (presence: IPresence[]) => {
	const lessonsToExcuse: {
		scheduleId: number | null;
		exemptionId: number | null;
	}[] = [];

	//	Index and dayOfWeek of days where status is "present", start at -1 as 0 is a valid index
	const maxPresence = [-1, -1, -1, -1, -1];
	presence.forEach((presence) => {
		if (maxPresence[presence.dayOfWeek]! < presence.index && presence.status === "present") {
			maxPresence[presence.dayOfWeek] = presence.index;
		}
	});

	//Lesson cannot be excused after the student has been present before that day
	presence.forEach((presence) => {
		if (
			(maxPresence[presence.dayOfWeek]! > presence.index || maxPresence[presence.dayOfWeek] === -1) &&
			(presence.status === "absent" || presence.status === "late")
		) {
			lessonsToExcuse.push({
				scheduleId: presence.id,
				exemptionId: presence.exemption.id,
			});
		}
	});

	return lessonsToExcuse;
};
