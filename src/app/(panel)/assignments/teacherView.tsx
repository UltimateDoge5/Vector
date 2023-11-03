"use client";
import Link from "next/link";
import { type AssignmentDto } from "~/types/dtos";
import { useReducer, useState } from "react";
import { Button } from "~/components/ui/button";
import { ActionModal } from "~/components/ui/modal";
import { Input } from "~/components/ui/input";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { type Assignment } from "~/server/db/schema";

const dateFormat = Intl.DateTimeFormat("pl-PL", {
	day: "numeric",
	month: "short",
	hour: "numeric",
	minute: "numeric",
});

export function TeacherView({
	assignments: assignmentsInit,
	classData,
	teacherId,
	submissionCount,
}: {
	assignments: AssignmentDto[];
	submissionCount: {
		count: number;
		assignmentId: number;
	}[];
	classData: {
		size: number;
		name:string;
		id: number;
	};
	teacherId: number;
}) {
	const [assignments, setAssignments] = useState<AssignmentDto[]>(assignmentsInit);
	const [assignmentData, setAssignmentData] = useReducer(
		(prev: ModalAssignment, next: Partial<ModalAssignment>) => ({ ...prev, ...next }),
		{
			name: "",
			description: "",
			dueDate: dayjs().set("minute", 0).set("hour", 0).toDate(),
			allowLate: false,
			fileRequired: false,
		} satisfies ModalAssignment,
	);
	const [modalOpen, setModalOpen] = useState(false);

	const addAssignment = () => {
		const ref = toast.loading("Dodawanie zadania...");
		fetch("/api/assignments", {
			method: "POST",
			body: JSON.stringify({
				...assignmentData,
				teacherId,
				classId: classData.id,
			} satisfies typeof Assignment.$inferInsert),
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then((res) => res.json())
			.then((assignment) => {
				setAssignments([...assignments, { ...assignmentData, ...assignment }]);
				toast.update(ref, { type: "success", render: "Dodano zadanie", isLoading: false, autoClose: 2000 });
			})
			.catch((err) => {
				console.error(err);
				toast.update(ref, { type: "error", render: "Nie udało się dodać zadania", isLoading: false, autoClose: 2000 });
			});
	};

	return (
		<>
			<div className="flex w-full flex-col rounded-lg">
				<div className="flex items-center justify-between pb-2 mb-3 border-b ">
					<h2 className=" border-l-4 border-accent pl-2 text-2xl font-bold">Zadania klasy {classData.name}</h2>
					<Button onClick={() => setModalOpen(true)}>Dodaj zadanie</Button>
				</div>

				<div className="flex flex-col gap-2">
					{assignments.length === 0 && <h3 className="text-center text-xl font-medium">Brak zadań dla tej klasy</h3>}
					{assignments.map((assignment) => {
						const nameId = assignment.name.replace(/\s/g, "-").toLowerCase();
						const submissions = submissionCount.find((s) => s.assignmentId === assignment.id)?.count ?? 0;

						return (
							<Link
								key={assignment.id}
								href={`/assignments/${nameId}-${assignment.id}`}
								className="relative grid w-full max-w-5xl gap-4 rounded-lg border bg-slate-50 px-4 py-2 shadow-sm transition-all hover:brightness-[103%]"
							>
								<div className="w-3/5">
									<h3 className="text-xl font-medium">{assignment.name}</h3>
									<p className="text-ellipsis text-text/80">{assignment.description}</p>
								</div>
								<span className="absolute right-4 top-2 flex w-fit items-center gap-2 rounded-lg px-2 py-1">
									Termin oddania: {dateFormat.format(assignment.dueDate)}
								</span>
								<span className="absolute bottom-2 right-4 flex w-1/5 items-center gap-2 rounded-lg px-2 py-1">
									<ProgressBar progress={(submissions / classData.size) * 100} />
									{submissions}/{classData.size}
								</span>
							</Link>
						);
					})}
				</div>
			</div>
			<ActionModal
				open={modalOpen}
				title="Dodaj zadanie"
				actionText="Dodaj"
				dismissible
				titleClassName="text-2xl"
				colors={{ button: "bg-primary hover:bg-primary/90 text-text" }}
				onConfirm={() => addAssignment()}
				setOpen={(v) => setModalOpen(v)}
				icon={false}
			>
				<div className="flex flex-col gap-2">
					<label className="flex flex-col gap-1 font-medium">
						Nazwa zadania
						<Input type="text" value={assignmentData.name} onChange={(e) => setAssignmentData({ name: e.target.value })} />
					</label>
					<label className="flex flex-col gap-1">
						Opis zadania
						<textarea
							className="w-full resize-none overflow-auto rounded-lg border bg-secondary/10 p-2 text-text focus:border-blue-500 focus:ring-blue-500"
							value={assignmentData.description ?? ""}
							onChange={(e) => setAssignmentData({ description: e.target.value })}
						/>
					</label>
					<label className="flex flex-col gap-1">
						Termin oddania
						<Input
							type="date"
							value={assignmentData.dueDate.toISOString().slice(0, 10)}
							onChange={(e) => setAssignmentData({ dueDate: new Date(e.target.value) })}
						/>
					</label>
					<label className="flex items-center gap-1">
						<input
							type="checkbox"
							checked={assignmentData.allowLate!}
							onChange={(e) => setAssignmentData({ allowLate: e.target.checked })}
						/>
						Pozwól na zwrot po terminie
					</label>
					<label className="flex items-center gap-1">
						<input
							type="checkbox"
							checked={assignmentData.fileRequired!}
							onChange={(e) => setAssignmentData({ fileRequired: e.target.checked })}
						/>
						Wymagany plik
					</label>
				</div>
			</ActionModal>
		</>
	);
}

type ModalAssignment = Omit<AssignmentDto, "id" | "teacherId" | "classId" | "creationDate">;

function ProgressBar({ progress }: { progress: number }) {
	return (
		<div className="relative h-2 w-full rounded-lg bg-accent/20">
			<div className="absolute left-0 top-0 h-full rounded-lg bg-accent" style={{ width: `${progress}%` }} />
		</div>
	);
}
