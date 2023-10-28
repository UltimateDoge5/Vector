"use client";
import { useState } from "react";
import { type IGrade, type ILesson } from "./page";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";

export function TeacherGradeView({
	lessons,
	students,
	initSelection,
	className,
}: {
	lessons: ILesson[];
	students: { name: string; id: number }[];
	initSelection: string;
	className: string;
}) {
	const [selectedLessonName, setSelectedLessonName] = useState(initSelection);

	const selectedLesson = lessons.find((g) => g.name === selectedLessonName)!;
	const grouped = groupByStudent(selectedLesson);
	const router = useRouter();

	return (
		<div className="flex w-full flex-col rounded-lg">
			<h2 className={`border-l-4 border-accent pl-2 text-2xl font-bold ${lessons.length > 1 ? "mb-1" : "mb-3"}`}>
				Oceny klasy {className}
			</h2>
			{lessons.length > 1 && (
				<>
					<p className="mb-2 text-text/80">Wybierz przedmiot z listy, aby zobaczyć oceny uczniów.</p>
					<div className="mb-4 flex gap-1 space-x-1 rounded-xl bg-blue-900/20 p-1">
						{lessons.map((lesson) => (
							<button
								key={lesson.name}
								onClick={() => {
									// set the selected lesson as the query param
									const url = new URL(window.location.href);
									url.searchParams.set("lesson", lesson.name);

									router.replace(url.toString());
									setSelectedLessonName(lesson.name);
								}}
								className={twMerge(
									"w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700",
									"ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
									lesson.name === selectedLessonName
										? "bg-white shadow"
										: "text-text hover:bg-white/[0.12] hover:text-white",
								)}
							>
								{lesson.name}
							</button>
						))}
					</div>
				</>
			)}
			<table className="border-collapse">
				<thead>
					<tr className="mb-2 py-2">
						<th className="h-12 p-2 text-left align-middle font-semibold">Uczeń</th>
						{selectedLesson.gradeDefinitions.map((g) => (
							<th key={g.name} className="h-12s p-2 text-left align-middle font-semibold">
								{g.name}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{students.map((student) => (
						<tr key={student.id} className="border-y py-2">
							<td className="h-12 border-r p-2 text-left align-middle">{student.name}</td>
							{selectedLesson.gradeDefinitions.map((def) => {
								const grade = grouped[student.id]?.find((g) => g.name === def.name);
								return (
									<td key={def.name} className="h-12 border-r p-2 text-left align-middle">
										{grade?.value ?? "-"}
									</td>
								);
							})}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

const groupByStudent = (selectedLesson: ILesson) => {
	const grouped: Record<number, Omit<IGrade, "lesson" | "weight">[]> = {};

	selectedLesson.gradeDefinitions.forEach((def) => {
		def.grades.forEach((grade) => {
			if (!grouped[grade.studentId]) {
				grouped[grade.studentId] = [];
			}

			grouped[grade.studentId]!.push({
				value: grade.grade,
				name: def.name,
				description: grade.description,
				timestamp: grade.timestamp,
				id: grade.id,
			});
		});
	});

	return grouped;
};
