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
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { ToastContainer, toast } from "react-toastify";

export function TeacherGradeView({
	lessons: lessonsInit,
	grades: gradesInit,
	students,
	initSelection,
	className,
}: {
	lessons: IColDef[];
	grades: Record<string, Record<number, Omit<IGrade, "weight" | "lesson" | "timestamp">[]>>;
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
		weight: 1,
		description: "",
		studentId: -1,
		defId: -1,
	});

	const router = useRouter();

	const selectedLesson = lessons.find((g) => g.name === selectedLessonName)!;
	const gradesSnapshot = useRef(structuredClone(grades[selectedLessonName]) ?? {});

	// Reset the snapshot when the selected lesson changes
	useEffect(() => {
		gradesSnapshot.current = structuredClone(grades[selectedLessonName]) ?? {};
	}, [selectedLessonName]);

	const saveChanges = async () => {
		setIsLoading(true);
		const res = await fetch("/grades/api/grade", {
			method: "PUT",
			body: JSON.stringify(changes),
		});

		setIsLoading(false);

		if (!res.ok) {
			toast("Wystąpił błąd podczas zapisywania zmian!", { type: "error" });
			return;
		}

		toast("Zmiany zapisano pomyślnie.", { type: "success" });
		gradesSnapshot.current = grades[selectedLessonName] ?? {};
		setChanges([]);
	};

	const isGettingDeleted = (defId: number, studentId: number) => {
		const changeIdx = changes.findIndex((c) => c.definitionId === defId && c.studentId === studentId);
		return changeIdx !== -1 && changes[changeIdx]!.type === "delete";
	};

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
										: "text-text hover:bg-white/[0.12] hover:text-white",
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
											className={`h-12 min-w-[96px] max-w-xs border-r p-2 text-left align-middle
												${isGettingDeleted(def.id, student.id) ? "bg-red-300/80" : ""}
											`}
											onClick={() => {
												if (isGettingDeleted(def.id, student.id)) return;
												setEditedCell([def.id, student.id]);
											}}
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
															if (e.key === "Escape") setEditedCell(null);
															else if (e.key === "Enter") {
																// Check if we can go to the next row
																const nextRowIdx = students.findIndex((s) => s.id === student.id) + 1;
																const nextRow = students[nextRowIdx];

																if (nextRow) setEditedCell([def.id, nextRow.id]);
																else setEditedCell(null);
															}
														}}
														onChange={(e) => {
															const value = e.target.valueAsNumber;
															if (isNaN(value) || isGettingDeleted(def.id, student.id)) return;

															// Check if the change already exists
															const changeIdx = changes.findIndex(
																(c) => c.definitionId === def.id && c.studentId === student.id,
															);

															// Check if the change is the same as the original value in the snapshot, if so, remove it or don't add it
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

																	const newGrades = structuredClone(grades);
																	newGrades[selectedLessonName]![student.id]!.splice(
																		newGrades[selectedLessonName]![student.id]!.findIndex(
																			(g) => g.name === def.name,
																		),
																		1,
																	);

																	setGrades(newGrades);
																}
																return;
															}

															// If the change already exists, update it
															if (changeIdx !== -1) {
																setChanges((changes) => {
																	changes[changeIdx]!.value = value;
																	return [...changes];
																});
																setGrades((grades) => {
																	grades[selectedLessonName]![student.id]!.find(
																		(g) => g.name === def.name,
																	)!.value = value;
																	return { ...grades };
																});
															} else {
																// If the change doesn't exist, add it
																setChanges((changes) => [
																	...changes,
																	{
																		type: "insert",
																		definitionId: def.id,
																		studentId: student.id,
																		description: null,
																		value,
																	},
																]);
																const newGrades = structuredClone(grades);
																if (!newGrades[selectedLessonName]![student.id])
																	newGrades[selectedLessonName]![student.id] = [];

																newGrades[selectedLessonName]![student.id]!.push({
																	id: -1,
																	name: def.name,
																	value,
																	description: null,
																});
																setGrades(newGrades);
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
																				onClick={() => {
																					setModalMode("desc");
																					setModalData({
																						name: def.name,
																						description: grade?.description ?? "",
																						studentId: student.id,
																						defId: def.id,
																					});
																				}}
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
																					active ? "bg-red-300" : "text-red-500"
																				} group flex w-full items-center rounded-md px-2 py-2 text-sm`}
																				onClick={(e) => {
																					e.stopPropagation();
																					setChanges((changes) => [
																						...changes,
																						{
																							type: "delete",
																							definitionId: def.id,
																							studentId: student.id,
																							description: null,
																							value: -1,
																						},
																					]);
																					setGrades((grades) => {
																						const newGrades = structuredClone(grades);
																						newGrades[selectedLessonName]![student.id]!.splice(
																							newGrades[selectedLessonName]![
																								student.id
																							]!.findIndex((g) => g.name === def.name),
																							1,
																						);

																						return newGrades;
																					});
																				}}
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
											</div>
										</td>
									);
								})}
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<Transition
				as={Fragment}
				show={changes.length > 0 || isLoading}
				enter="transition ease-out duration-200"
				enterFrom="opacity-0"
				enterTo="opacity-100"
				leave="transition ease-in duration-100"
				leaveFrom="opacity-100"
				leaveTo="opacity-0"
			>
				<div className="fixed bottom-0 right-0 flex w-full justify-between rounded-t-lg border-b-4 border-accent/80 bg-white p-4">
					<h3 className="inline-flex items-center gap-2 text-xl">
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20">
							<ExclamationTriangleIcon className="h-6 w-6 stroke-accent/80" />
						</div>
						Masz niezapisane zmiany!
					</h3>
					<div className="flex items-center justify-center gap-2">
						<Button
							disabled={isLoading}
							className="bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-200"
							onClick={() => {
								setChanges([]);
								setGrades((grades) => {
									grades[selectedLessonName] = structuredClone(gradesSnapshot.current);
									return { ...grades };
								});
							}}
						>
							Cofnij
						</Button>
						<Button
							loading={isLoading}
							disabled={isLoading}
							className="rounded-lg bg-primary px-4 py-2 text-text disabled:cursor-not-allowed disabled:opacity-50"
							onClick={saveChanges}
						>
							Zapisz zmiany
						</Button>
					</div>
				</div>
			</Transition>

			<ActionModal
				open={modalMode === "def"}
				setOpen={() => setModalMode("")}
				title="Dodaj kolumnę"
				actionText="Zapisz"
				dismissible
				colors={{
					button: "bg-primary hover:bg-primary/[0.8] text-text",
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
							weight: modalData.weight!,
						}),
					});

					setIsLoading(false);

					if (!res.ok) {
						console.error(res);
						return;
					}

					const { id } = (await res.json()) as { id: string };

					const newLessons = [...lessons];
					newLessons
						.find((l) => l.name === selectedLessonName)!
						.gradeDefinitions.push({
							id: parseInt(id),
							name: modalData.name!,
							weight: modalData.weight!,
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

			<ActionModal
				open={modalMode === "desc"}
				setOpen={() => setModalMode("")}
				title={editedCell ? "Edytuj opis" : "Dodaj opis"}
				actionText="Zapisz"
				dismissible
				colors={{
					button: "bg-primary hover:bg-primary/[0.8] text-text",
				}}
				icon={false}
				titleClassName="text-2xl"
				confirmDisabled={!modalData.description}
				onConfirm={() => {
					// Check if the change already exists
					const changeIdx = changes.findIndex((c) => c.definitionId === modalData.defId && c.studentId === modalData.studentId);

					// If the change already exists, update it
					if (changeIdx !== -1) {
						setChanges((changes) => {
							changes[changeIdx]!.description = modalData.description!;
							return [...changes];
						});
						// Grade always exists, so we don't need to check for it
						setGrades((grades) => {
							console.log(grades[selectedLessonName]![modalData.studentId]);
							grades[selectedLessonName]![modalData.studentId]!.find((g) => g.name === modalData.name)!.description =
								modalData.description!;
							return { ...grades };
						});
					} else {
						// If the change doesn't exist, add it
						setChanges((changes) => [
							...changes,
							{
								type: "update",
								definitionId: modalData.defId,
								studentId: modalData.studentId,
								description: modalData.description!,
							},
						]);
						// Grade always exists, so we don't need to check for it
						setGrades((grades) => {
							grades[selectedLessonName]![modalData.studentId]!.find((g) => g.name === modalData.name)!.description =
								modalData.description!;
							return { ...grades };
						});
					}
				}}
			>
				<div className="flex flex-col gap-2">
					<textarea
						className="h-32 w-full resize-none rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
						name="desc"
						id="desc"
						value={modalData.description}
						onChange={(e) => setModalData({ description: e.target.value })}
					/>
				</div>
			</ActionModal>
			<ToastContainer />
		</>
	);
}

interface ModalData {
	name?: string;
	weight?: number;
	description?: string;
	studentId: number;
	defId: number;
}

interface IChange {
	type: "insert" | "update" | "delete";
	value?: number;
	studentId: number;
	definitionId: number;
	description: string | null;
}
