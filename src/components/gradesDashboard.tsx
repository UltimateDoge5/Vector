"use client";

import { GradesColors } from "~/app/(panel)/grades/view";

const dateFormat = Intl.DateTimeFormat("pl", { day: "numeric", month: "long", year: "numeric" });

export default function GradesDashboard({ grades }: { grades: Igrades[] }) {
	const grouped = groupByLesson(grades);

	return (
		<div className="flex w-full flex-col gap-2 rounded-2xl bg-white p-3 px-4">
			<h1 className="pb border-b pl-3 text-lg font-medium">Ostatnie oceny</h1>
			{Object.entries(grouped)
				.filter(([_, g]) => g.length > 0)
				.map(([lesson, grades]) => (
					<div key={lesson} className="grid grid-cols-[144px_auto]">
						<span className="p-2">{lesson}:</span>
						<span className="p-2">
							<div key={lesson} className="flex flex-wrap justify-start gap-2">
								{grades.map((grade) => (
									<div
										key={grade.id}
										className={`${
											GradesColors[grade.value - 1]
										} group relative flex h-7 w-7 items-center justify-center rounded text-lg`}
									>
										<div className="pointer-events-none absolute top-full z-10 flex w-max max-w-md flex-col gap-0.5 rounded-md bg-white p-2 text-sm text-black opacity-0 shadow transition-all group-hover:pointer-events-auto group-hover:opacity-100">
											<span className="font-bold">Tytuł: {grade.name}</span>
											<span>Waga: {grade.weight}</span>
											<span>Opis: {grade.description ?? "Brak opisu"}</span>
											<span>Data: {dateFormat.format(grade.timestamp)}</span>
										</div>

										{grade.value}
									</div>
								))}
							</div>
						</span>
					</div>
				))}
		</div>
	);
}
const groupByLesson = (grades: Igrades[]) => {
	const grouped: Record<string, Igrades[]> = {};
	for (const grade of grades) {
		if (!grouped[grade.lesson]) grouped[grade.lesson] = [];
		grouped[grade.lesson]!.push(grade);
	}

	return grouped;
};

interface Igrades {
	id: number;
	name: string;
	value: number;
	description: string | null;
	weight: number;
	lesson: string;
	timestamp: Date;
}
