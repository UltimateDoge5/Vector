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

	return (
		<div className="flex w-full flex-col items-center justify-center rounded-lg">
			<table className="w-full table-fixed">
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
							className={
								index % 2 == 1 ? "py-2" : "bg-secondary/20 py-2"
							}
						>
							<td className="p-4 align-middle">
								{hour.from} - {hour.to}
							</td>
							{[0, 1, 2, 3, 4].map((day) => {
								const lesson = schedule.find(
									(lesson) =>
										lesson.dayOfWeek === day &&
										lesson.index === index,
								);

								if (lesson) {
									return (
										<td
											className="rounded-lg p-2 align-middle"
											key={day}
										>
											<div
												className="rounded-lg p-2"
												style={{
													background:
														stringToHslColor(
															lesson.lesson.name!,
															80,
															80,
														),
												}}
											>
												<h3>{lesson.lesson.name}</h3>
												<p className="text-sm font-light">
													{lesson.teacher.name} | sala{" "}
													{lesson.room}
												</p>
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
	id: number;
	dayOfWeek: number;
	index: number;
	room: string;
	lesson: {
		id: number;
		name: string | null;
	};
	class: {
		id: number;
		students: {
			id: number;
		}[];
	};
	teacher: {
		name: string;
	};
	// exemptions: {}[]
}
