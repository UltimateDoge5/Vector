"use client";
import { PlusIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Button } from "~/components/ui/button";
import { type IColDef, type IGrade } from "./page";
import { GradesColors } from "./view";

export function TeacherGradeView({
	lessons: lessonsInit,
	grades: gradesInit,
	students,
	initSelection,
	className,
}: {
	lessons: IColDef[];
	grades: Record<string, Record<number, Omit<IGrade, "weight" | "lesson">[]>>;
	students: { name: string; id: number }[];
	initSelection: string;
	className: string;
}) {
	const [lessons, setLessons] = useState(lessonsInit); // We need this for the coulumn defs
	const [grades, setGrades] = useState(gradesInit);
	const [selectedLessonName, setSelectedLessonName] = useState(initSelection);

	const [editedCell, setEditedCell] = useState<[number, number] | null>(null); // [defId, studentId]
	const [changes, setChanges] = useState<IChange[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const selectedLesson = lessons.find((g) => g.name === selectedLessonName)!;
	const gradesSnapshot = useRef(grades[selectedLessonName] ?? {});

	// Reset the snapshot when the selected lesson changes
	useEffect(() => {
		gradesSnapshot.current = grades[selectedLessonName] ?? {};
	}, [selectedLessonName]);

	return (
		<div className="flex w-full flex-col rounded-lg">
			<div className="flex items-end justify-between py-4">
				<div className="flex flex-col gap-1">
					<h2 className={`border-l-4 border-accent pl-2 text-2xl font-bold ${lessons.length > 1 ? "mb-1" : "mb-3"}`}>
						Oceny klasy {className}
					</h2>
					{lessons.length > 1 && <p className="mb-2 text-text/80">Wybierz przedmiot z listy, aby zobaczyć oceny uczniów.</p>}
				</div>
				<Button icon={<PlusIcon className="h-5 w-5" />}>Dodaj kolumnę</Button>
			</div>

			{lessons.length > 1 && (
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
									? "bg-slate-200 shadow"
									: "text-text hover:bg-white/[0.12] hover:text-white",
							)}
						>
							{lesson.name}
						</button>
					))}
				</div>
			)}
			<table>
				<thead>
					<tr className="mb-2 py-2">
						<th className="h-12 p-2 text-left align-middle font-semibold">Uczeń</th>
						{selectedLesson.gradeDefinitions.map((g) => (
							<th key={g.name} className="h-12 border-x p-2 text-left align-middle font-semibold">
								{g.name}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{students.map((student) => (
						<tr key={student.id} className="border-y py-2">
							<td className="h-12 border-r p-2 text-left align-middle">{student.name}</td>
							{selectedLesson.gradeDefinitions.map((def, j) => {
								const grade = grades[selectedLessonName]![student.id]?.find((g) => g.name === def.name);
								return (
									<td
										key={def.name}
										className="h-12 border-r p-2 text-left align-middle"
										onClick={() => setEditedCell([def.id, student.id])}
										onBlur={() => setEditedCell(null)}
									>
										{editedCell?.[0] === def.id && editedCell?.[1] === student.id ? (
											<input
												autoFocus
												type="number"
												defaultValue={grade?.value}
												className="h-full w-24 rounded p-1 text-center"
												onBlur={() => setEditedCell(null)}
												onKeyDown={(e) => {
													if (e.key === "Escape" || e.key === "Enter") setEditedCell(null);
												}}
												onChange={(e) => {
													const value = e.target.valueAsNumber;
													if (isNaN(value)) return;

													// Check if the change already exists
													const changeIdx = changes.findIndex(
														(c) => c.gradeDefinitionId === def.id && c.studentId === student.id,
													);

													// Check if the change is the same as the original value in the snapshot, if so, remove it or dont add it
													const originalValue = gradesSnapshot.current[student.id]?.find(
														(g) => g.name === def.name,
													)?.value;

													// If the change is the same as the original value, remove it
													if (value === originalValue) {
														if (changeIdx !== -1) {
															setChanges((changes) => {
																changes.splice(changeIdx, 1);
																return [...changes];
															});
															setGrades((grades) => {
																grades[selectedLessonName]![student.id]!.filter((g) => g.name !== def.name);
																return { ...grades };
															});
														}
														return;
													}

													// If the change already exists, update it
													if (changeIdx !== -1) {
														setChanges((changes) => {
															changes[changeIdx] = {
																gradeDefinitionId: def.id,
																studentId: student.id,
																value,
															};

															return [...changes];
														});
														setGrades((grades) => {
															grades[selectedLessonName]![student.id]!.find(
																(g) => g.name === def.name,
															)!.value = value;
															return { ...grades };
														});
													} else {
														// If the change doesnt exist, add it
														setChanges((changes) => [
															...changes,
															{
																gradeDefinitionId: def.id,
																studentId: student.id,
																value,
															},
														]);
														setGrades((grades) => {
															if (!grades[selectedLessonName]![student.id])
																grades[selectedLessonName]![student.id] = [];

															grades[selectedLessonName]![student.id]!.push({
																id: -1,
																name: def.name,
																value,
																description: null,
																timestamp: new Date(),
															});
															return { ...grades };
														});
													}
												}}
											/>
										) : (
											<div
												className={`${
													grade?.value !== undefined ? GradesColors[grade.value - 1] : ""
												} flex h-7 w-7 items-center justify-center rounded text-lg`}
											>
												{grade?.value ?? "-"}
											</div>
										)}
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

interface IChange {
	studentId: number;
	gradeDefinitionId: number;
	value: number;
}
