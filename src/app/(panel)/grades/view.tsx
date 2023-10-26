import { type IGrade } from "./page";

const GradesColors = ["bg-red-500/40", "bg-purple-400/40", "bg-yellow-500/40", "bg-blue-400/40", "bg-emerald-400/40", "bg-green-400/40	"];

export default function GradesView({ grades }: { grades: IGrade[] }) {
	const grouped = groupByLesson(grades);
	return (
		<div className="flex w-full flex-col rounded-lg">
			<h2 className="mb-3 border-l-4 border-accent pl-2 text-2xl font-bold">Oceny</h2>
			<table>
				<thead>
					<tr className="mb-2 border-y py-2">
						<th className="h-12 w-20 border-r-2 p-2 text-left align-middle">Przedmiot</th>
						<th className="h-12 p-2 text-left align-middle">Oceny</th>
					</tr>
				</thead>
				<tbody>
					{Object.entries(grouped).map(([lesson, grades]) => (
						<tr key={lesson}>
							<td className="border-r-2 p-2">{lesson}</td>
							<td className="p-2">
								<div key={lesson} className="flex flex-wrap justify-start gap-2">
									{grades.map((grade) => (
										<div
											key={grade.id}
											className={`${
												GradesColors[grade.value - 1]
											} flex h-7 w-7 items-center justify-center rounded text-lg`}
										>
											{grade.value}
										</div>
									))}
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

const groupByLesson = (grades: IGrade[]) => {
	const grouped: Record<string, IGrade[]> = {};
	for (const grade of grades) {
		if (!grouped[grade.lesson]) grouped[grade.lesson] = [];
		grouped[grade.lesson]!.push(grade);
	}

	return grouped;
};
