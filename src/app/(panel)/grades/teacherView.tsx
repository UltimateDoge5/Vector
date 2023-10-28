"use client";
import { useState } from "react";
import { type IGrade, type ILesson } from "./page";

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

	return (
		<div className="flex w-full flex-col rounded-lg">
			<h2 className="pl-c2 mb-3 border-l-4 border-accent text-2xl font-bold">Oceny klasy {className}</h2>
			<table className="table-auto">
				<thead>
					<tr className="mb-2 border-y py-2">
						<th className="h-12 border-r-2 p-2 text-left align-middle">Uczeń</th>
						{selectedLesson.gradeDefinitions.map((g) => (
							<th key={g.name} className="h-12border-r-2 p-2 text-left align-middle">
								{g.name}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{students.map((student) => (
						<tr key={student.id} className="border-y py-2">
							<td className="h-12 border-r-2 p-2 text-left align-middle">{student.name}</td>
							{selectedLesson.gradeDefinitions.map((def) => {
								const grade = grouped[student.id]?.find((g) => g.name === def.name);
								return (
									<td key={def.name} className="h-12 border-r-2 p-2 text-left align-middle">
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
