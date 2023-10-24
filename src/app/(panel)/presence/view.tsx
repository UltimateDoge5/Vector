import { InformationCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { type Presence } from "~/server/db/schema";

import { calculateWeekDates, calculateBlockHeight, type IPresence, days, schoolHours } from "~/util/scheduleUtil";

export type PresenceStatus = (typeof Presence.$inferSelect)["status"] | "none";

interface Block extends IPresence {
	from: number;
	to: number;
}

export const legend = {
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

export function PresenceView({ presence, weekDate }: { presence: IPresence[]; weekDate?: string }) {
	const maxIndex = Math.max(...presence.map((lesson) => lesson.index));

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

	return (
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

			<div className="mb-2 flex justify-center gap-8">
				{Object.entries(legend).map(([key, value]) => (
					<div key={key} className="flex items-center gap-2">
						<div className={`h-5 w-5 rounded-md ${value.color}`} />
						<p className="text-lg">{value.text}</p>
					</div>
				))}
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

								if (block.from === index) {
									return (
										<td rowSpan={block.to - block.from + 1} className="p-1.5 align-middle" key={day}>
											<div
												className={`relative h-max rounded-lg p-2 transition-all ${legend[block.status].color} ${
													block.exemption.cancelation ? "line-through" : "hover:saturate-150"
												}`}
												style={{
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
