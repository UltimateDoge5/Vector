const hours = [
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

const days = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek"];

export function ScheduleView({ schedule }: { schedule: Schedule[] }) {
	const maxIndex = Math.max(...schedule.map((lesson) => lesson.index));

	// If there are two or more same lessons in a row, merge them

	interface Block extends Schedule {
		from: number;
		to: number;
	}

	const blocks: Block[] = [];
	schedule.forEach((lesson) => {
		// Check for block with the same lesson
		const block = blocks.find(
			(block) =>
				block.lesson.id === lesson.lesson.id &&
				block.teacher.name === lesson.teacher.name &&
				block.room === lesson.room,
		);

		if (block) {
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

	console.log(blocks);

	return (
		<div className="flex w-full flex-col items-center justify-center rounded-lg">
			<table className="w-full table-fixed">
				<colgroup>
					<col className="w-[10%]" />
				</colgroup>
				<tbody className="[&_tr:last-child]:border-0">
					<tr>
						<th className="h-12 w-1/6 px-4 text-left align-middle font-medium">
							Lekcja
						</th>
						{days.map((day) => (
							<th
								key={day}
								className="h-12 px-4 text-left align-middle font-medium"
							>
								{day}
							</th>
						))}
					</tr>
					{hours.slice(0, maxIndex + 2).map((hour, index) => (
						<tr
							key={index}
							className={index % 2 == 1 ? "" : "bg-secondary/20"}
						>
							<td className="p-4 align-middle">
								{hour.from} - {hour.to}
							</td>
							{[0, 1, 2, 3, 4].map((day) => {
								const block = blocks.find(
									(pBlock) =>
										pBlock.from <= index &&
										pBlock.to >= index &&
										pBlock.dayOfWeek === day,
								);

								if (!block) return <td key={day} />;

								if (block && block.from === index) {
									return (
										<td
											rowSpan={block.to - block.from + 1}
											className=" rounded-lg p-1.5 align-middle transition-colors hover:saturate-150"
											key={day}
										>
											<div
												className="h-max rounded-lg p-2"
												style={{
													background:
														stringToHslColor(
															block.lesson.name!,
															80,
															80,
														),
													height: `${72 * (block.to - block.from + 1) - 4}`,
												}}
											>
												<h3>{block.lesson.name}</h3>
												<p className="text-sm font-light">
													{block.teacher.name} | sala{" "}
													{block.room}
												</p>
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

interface Schedule {
	dayOfWeek: number;
	index: number;
	room: string;
	lesson: {
		id: number;
		name: string | null;
	};
	teacher: {
		name: string;
	};
}
