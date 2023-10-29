"use client";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon, PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useReducer, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Button } from "~/components/ui/button";
import { type IColDef, type IGrade } from "./page";
import { GradesColors } from "./view";
import { ActionModal } from "~/components/ui/modal";
import { Input } from "~/components/ui/input";

export function TeacherGradeView({
	                                 lessons: lessonsInit,
	                                 grades: gradesInit,
	                                 students,
	                                 initSelection,
	                                 className
                                 }: {
	lessons: IColDef[];
	grades: Record<string, Record<number, Omit<IGrade, "weight" | "lesson">[]>>;
	students: { name: string; id: number }[];
	initSelection: string;
	className: string;
}) {
	const [lessons, setLessons] = useState(lessonsInit); // We need this for the column defs
	const [grades, setGrades] = useState(gradesInit);
	const [selectedLessonName, setSelectedLessonName] = useState(initSelection);

	const [editedCell, setEditedCell] = useState<[number, number] | null>(null); // [defId, studentId]
	const [modalMode, setModalMode] = useState<"def" | "desc" | "">("");
	const [changes, setChanges] = useState<IChange[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const [modalData, setModalData] = useReducer((state: ModalData, newState: Partial<ModalData>) => ({ ...state, ...newState }), {
		name: "",
		weight: 1
	});

	const router = useRouter();

	const selectedLesson = lessons.find((g) => g.name === selectedLessonName)!;
	const gradesSnapshot = useRef(grades[selectedLessonName] ?? {});

	// Reset the snapshot when the selected lesson changes
	useEffect(() => {
		gradesSnapshot.current = grades[selectedLessonName] ?? {};
	}, [selectedLessonName]);

	return (
		<>
			<div className="flex w-full flex-col rounded-lg">
				<div className="flex items-end justify-between py-4">
					<div className="flex flex-col gap-1">
						<h2 className={`border-l-4 border-accent pl-2 text-2xl font-bold ${lessons.length > 1 ? "mb-1" : "mb-3"}`}>
							Oceny klasy {className}
						</h2>
						{lessons.length > 1 && <p className="mb-2 text-text/80">Wybierz przedmiot z listy, aby zobaczyć oceny uczniów.</p>}
					</div>
					<Button
						icon={<PlusIcon className="h-5 w-5" />}
						onClick={() => {
							setModalData({ name: "", weight: 1 });
							setModalMode("def");
						}}
					>
						Dodaj kolumnę
					</Button>
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
									: "text-text hover:bg-white/[0.12] hover:text-white"
								)}
							>
								{lesson.name}
							</button>
						))}
					</div>
				)}
				<table>
					<colgroup>
						<col className="min-w-[96px] max-w-[192px]" />
						{selectedLesson.gradeDefinitions.map((g) => (
							<col key={g.name} className="min-w-[144px] max-w-xs" />
						))}
					</colgroup>
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
								{selectedLesson.gradeDefinitions.map((def) => {
									const grade = grades[selectedLessonName]![student.id]?.find((g) => g.name === def.name);
									return (
										<td
											key={def.name}
											className="h-12 min-w-[96px] max-w-xs border-r p-2 text-left align-middle"
											onClick={() => setEditedCell([def.id, student.id])}
											onBlur={() => setEditedCell(null)}
										>
											<div className="inline-flex w-full items-center justify-between">
												{editedCell?.[0] === def.id && editedCell?.[1] === student.id ? (
													<input
														autoFocus
														type="number"
														defaultValue={grade?.value}
														className="h-full w-24 rounded p-1 text-center"
														onKeyDown={(e) => {
															if (e.key === "Escape" || e.key === "Enter") setEditedCell(null);
														}}
														onChange={(e) => {
															const value = e.target.valueAsNumber;
															if (isNaN(value)) return;

															// Check if the change already exists
															const changeIdx = changes.findIndex(
																(c) => c.gradeDefinitionId === def.id && c.studentId === student.id
															);

															// Check if the change is the same as the original value in the snapshot, if so, remove it or don't add it
															const originalValue = gradesSnapshot.current[student.id]?.find(
																(g) => g.name === def.name
															)?.value;

															// If the change is the same as the original value, remove it
															if (value === originalValue) {
																if (changeIdx !== -1) {
																	setChanges((changes) => {
																		changes.splice(changeIdx, 1);
																		return [...changes];
																	});
																	setGrades((grades) => {
																		grades[selectedLessonName]![student.id]!.filter(
																			(g) => g.name !== def.name
																		);
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
																		description: null,
																		value
																	};

																	return [...changes];
																});
																setGrades((grades) => {
																	grades[selectedLessonName]![student.id]!.find(
																		(g) => g.name === def.name
																	)!.value = value;
																	return { ...grades };
																});
															} else {
																// If the change doesn't exist, add it
																setChanges((changes) => [
																	...changes,
																	{
																		gradeDefinitionId: def.id,
																		studentId: student.id,
																		description: null,
																		value
																	}
																]);
																setGrades((grades) => {
																	if (!grades[selectedLessonName]![student.id])
																		grades[selectedLessonName]![student.id] = [];

																	grades[selectedLessonName]![student.id]!.push({
																		id: -1,
																		name: def.name,
																		value,
																		description: null,
																		timestamp: new Date()
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
												{grade?.value && (
													<Menu as="div" className="relative inline-block text-left">
														<div>
															<Menu.Button className="inline-flex w-full justify-center rounded-md px-2 py-2 text-sm font-medium  hover:bg-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
																<span className="sr-only">Grade edit options</span>
																<EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
															</Menu.Button>
														</div>
														<Transition
															as={Fragment}
															enter="transition ease-out duration-100"
															enterFrom="transform opacity-0 scale-95"
															enterTo="transform opacity-100 scale-100"
															leave="transition ease-in duration-75"
															leaveFrom="transform opacity-100 scale-100"
															leaveTo="transform opacity-0 scale-95"
														>
															<Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
																<div className="px-1 py-1 ">
																	<Menu.Item>
																		{({ active }) => (
																			<button
																				className={`${
																					active ? "bg-primary text-text" : "text-gray-900"
																				} group flex w-full items-center rounded-md px-2 py-2 text-sm`}
																				onClick={() => setModalMode("desc")}
																			>
																				<PencilIcon className="mr-2 h-5 w-5" aria-hidden="true" />
																				{grade?.description === null
																				 ? "Add description"
																				 : "Edit description"}
																			</button>
																		)}
																	</Menu.Item>
																</div>
																<div className="px-1 py-1">
																	<Menu.Item>
																		{({ active }) => (
																			<button
																				className={`${
																					active ? "bg-red-300 " : "text-red-500"
																				} group flex w-full items-center rounded-md px-2 py-2 text-sm`}
																				onClick={() =>
																					setGrades((grades) => {
																						grades[selectedLessonName]![student.id]!.filter(
																							(g) => g.name !== def.name
																						);
																						return { ...grades };
																					})
																				}
																			>
																				<TrashIcon className="mr-2 h-5 w-5" aria-hidden="true" />
																				Delete
																			</button>
																		)}
																	</Menu.Item>
																</div>
															</Menu.Items>
														</Transition>
													</Menu>
												)}
												<ActionModal
													open={modalMode === "desc"}
													setOpen={() => setModalMode("")}
													title={editedCell ? "Edytuj opis" : "Dodaj opis"}
													actionText="Zapisz"
													dismissible
													colors={{
														button: "bg-primary hover:bg-primary/[0.8] text-text"
													}}
													icon={false}
													titleClassName="text-2xl"
													confirmDisabled={!modalData.description}
													onConfirm={() => {
														// Check if the change already exists
														const changeIdx = changes.findIndex(
															(c) => c.gradeDefinitionId === def.id && c.studentId === student.id
														);

														// If the change already exists, update it
														if (changeIdx !== -1) {
															setChanges((changes) => {
																changes[changeIdx] = {
																	gradeDefinitionId: def.id,
																	studentId: student.id,
																	description: modalData.description!,
																	value: grade!.value
																};

																return [...changes];
															});
															setGrades((grades) => {
																grades[selectedLessonName]![student.id]!.find(
																	(g) => g.name === def.name
																)!.description = modalData.description!;
																return { ...grades };
															});
														} else {
															// If the change doesn't exist, add it
															setChanges((changes) => [
																...changes,
																{
																	gradeDefinitionId: def.id,
																	studentId: student.id,
																	description: modalData.description!,
																	value: grade!.value
																}
															]);
															setGrades((grades) => {
																if (!grades[selectedLessonName]![student.id])
																	grades[selectedLessonName]![student.id] = [];

																grades[selectedLessonName]![student.id]!.push({
																	id: -1,
																	name: def.name,
																	value: grade!.value,
																	description: modalData.description!,
																	timestamp: new Date()
																});
																return { ...grades };
															});
														}
													}}
												>
													<div className="flex flex-col gap-2">
														<textarea
															className="h-32 resize-none rounded p-2 w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
															name="desc"
															id="desc"
															value={modalData.description}
															onChange={(e) => setModalData({ description: e.target.value })}
														/>
													</div>
												</ActionModal>
											</div>
										</td>
									);
								})}
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<ActionModal
				open={modalMode === "def"}
				setOpen={() => setModalMode("")}
				title="Dodaj kolumnę"
				actionText="Zapisz"
				dismissible
				colors={{
					button: "bg-primary hover:bg-primary/[0.8] text-text"
				}}
				loading={isLoading}
				icon={false}
				titleClassName="text-2xl"
				confirmDisabled={!modalData.name || modalData.name.length < 3 || !modalData.weight || modalData.weight < 1}
				onConfirm={async () => {
					setIsLoading(true);
					const res = await fetch("/grades/api/gradeDef", {
						method: "POST",
						body: JSON.stringify({
							lessonId: lessons.find((l) => l.name === selectedLessonName)!.id,
							name: modalData.name!,
							weight: modalData.weight!
						})
					});

					setIsLoading(false);

					if (!res.ok) {
						console.error(res);
						return;
					}

					const { id } = (await res.json()) as { id: string };

					const newLessons = [...lessons];
					newLessons.find((l) => l.name === selectedLessonName)!.gradeDefinitions.push({
						id: parseInt(id),
						name: modalData.name!,
						weight: modalData.weight!
					});
					setLessons(newLessons);
					setModalMode("");
				}}
			>
				<div className="flex flex-col gap-2">
					<label htmlFor="name">Nazwa</label>
					<Input
						type="text"
						name="name"
						id="name"
						value={modalData.name}
						onChange={(e) => setModalData({ name: e.target.value })}
					/>
					<label htmlFor="weight">Waga</label>
					<Input
						type="number"
						name="weight"
						id="weight"
						min="1"
						value={modalData.weight}
						onChange={(e) => setModalData({ weight: e.target.valueAsNumber })}
					/>
				</div>
			</ActionModal>
		</>
	);
}

interface ModalData {
	name?: string;
	weight?: number;
	description?: string;

}

interface IChange {
	studentId: number;
	gradeDefinitionId: number;
	value: number;
	description: string | null;
}
