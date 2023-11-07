"use client";
import { type AssignmentDto, type SubmissionDto } from "~/types/dtos";
import { submittedAtFormat } from "~/app/(panel)/assignments/[nameId]/view";
import Link from "next/link";
import React, { Fragment, useReducer, useState } from "react";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { Menu, Transition } from "@headlessui/react";
import { ArchiveBoxXMarkIcon, EllipsisVerticalIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { DataTable } from "~/components/dataTable";
import { type ColumnDef } from "@tanstack/react-table";
import { Input } from "~/components/ui/input";
import { ActionModal } from "~/components/ui/modal";
import { type ModalAssignment } from "../teacherView";
import { type Assignment } from "~/server/db/schema";

const columns: ColumnDef<TableItem>[] = [
	{
		header: "Uczeń",
		accessorKey: "studentName",
		cell: ({ row }) => (
			<Link className="underline" href={row.original.link}>
				{row.getValue("studentName")}
			</Link>
		),
	},
	{
		id: "graded",
		header: "Oceniono",
		cell: ({ row }) => <span>{row.original.graded ? "Tak" : "Nie"}</span>,
	},
	{
		header: "Wysłano",
		accessorKey: "sentAt",
	},
];

export function TeacherAssignmentView({ assignment, submissions }: { assignment: AssignmentDto; submissions: StudentSubmissions[] }) {
	const [assignmentData, setAssignmentData] = useReducer(
		(prev: ModalAssignment, next: Partial<ModalAssignment>) => ({ ...prev, ...next }),
		{
			...assignment,
		} satisfies ModalAssignment,
	);
	const [modalOpen, setModalOpen] = useState(false);
	const router = useRouter();

	const editAssignment = async () => {
		const ref = toast.loading("Edytowanie zadania...");
		const res = await fetch("/api/assignments", {
			method: "PUT",
			body: JSON.stringify({
				...assignmentData,
				id: assignment.id,
			} satisfies Partial<typeof Assignment.$inferInsert>),
		});

		if (!res.ok)
			return toast.update(ref, { type: "error", isLoading: false, render: "Nie udało się edytować zadania", autoClose: 2000 });

		toast.update(ref, { type: "success", isLoading: false, render: "Zadanie zostało edytowane", autoClose: 2000 });
		setTimeout(() => router.refresh(), 1250);
	};

	const deleteAssignment = async () => {
		const ref = toast.loading("Usuwanie zadania...");
		const res = await fetch("/api/assignments", {
			method: "DELETE",
			body: JSON.stringify({ id: assignment.id }),
		});

		if (!res.ok) return toast.update(ref, { type: "error", isLoading: false, render: "Nie udało się usunąć zadania", autoClose: 2000 });

		toast.update(ref, { type: "success", isLoading: false, render: "Zadanie zostało usunięte", autoClose: 2000 });
		setTimeout(() => router.replace("/assignments"), 1000);
	};

	return (
		<>
			<div className="mb-1 flex items-center gap-2 text-sm">
				<Link href={`/assignments`} className="hover:underline">
					Zadania
				</Link>
				<ChevronRightIcon className="inline h-5 w-5" />
				<Link href={`/assignments/${linkify(assignment.name, assignment.id)}`} className="hover:underline">
					{assignment.name}
				</Link>
			</div>
			<DataTable
				data={submissions.map(
					(submission) =>
						({
							studentName: submission.student.name,
							graded: submission.graded,
							sentAt: submittedAtFormat.format(submission.sentAt),
							link: `/assignments/${linkify(assignment.name, assignment.id)}/submission/${linkify(
								submission.student.name,
								submission.id,
							)}`,
						}) satisfies TableItem,
				)}
				columns={columns}
				description={assignment.description ?? "Brak opisu"}
				noDataText="Brak zwróconych zadań"
				title={`Zadanie - ${assignment.name}`}
				primaryActionBtn={
					<div className="flex items-center gap-2">
						<span>Termin: {submittedAtFormat.format(assignment.dueDate)}</span>
						<Menu as="div" className="relative inline-block text-right">
							<div>
								<Menu.Button className="rounded-3x inline-flex w-full justify-end px-2 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
									<EllipsisVerticalIcon className="h-5 w-5 text-accent/70" />
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
								<Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
									<div className="px-1 py-1">
										<Menu.Item>
											{({ active }) => (
												<button
													className={`${
														active ? "bg-accent/50 text-white" : "text-text"
													} group flex w-full items-center rounded-md px-2 py-2 text-sm`}
													onClick={() => setModalOpen(true)}
												>
													<PencilSquareIcon className="mr-2 h-5 w-5" aria-hidden="true" />
													Edytuj
												</button>
											)}
										</Menu.Item>
									</div>
									<div className="px-1 py-1">
										<Menu.Item>
											{({ active }) => (
												<button
													className={`${
														active ? "bg-red-400 text-white" : "text-text"
													} group flex w-full items-center rounded-md px-2 py-2 text-sm`}
													onClick={() => deleteAssignment()}
												>
													<ArchiveBoxXMarkIcon className="mr-2 h-5 w-5" aria-hidden="true" />
													Usuń
												</button>
											)}
										</Menu.Item>
									</div>
								</Menu.Items>
							</Transition>
						</Menu>
					</div>
				}
			/>
			<ActionModal
				open={modalOpen}
				title="Edytuj zadanie"
				actionText="Zapisz"
				dismissible
				titleClassName="text-2xl"
				colors={{ button: "bg-primary hover:bg-primary/90 text-text" }}
				onConfirm={() => editAssignment()}
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

export const linkify = (text: string, id: number) => text.toLowerCase().replaceAll(" ", "-") + "-" + id;

interface TableItem {
	link: string;
	studentName: string;
	graded: boolean;
	sentAt: string;
}

type StudentSubmissions = SubmissionDto & {
	student: {
		id: number;
		name: string;
	};
};
