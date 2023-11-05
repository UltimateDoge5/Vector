"use client";
import { useState } from "react";
import AddClassModal from "~/components/AddClassModal";
import { type teachersInterface } from "./page";

import { type ColumnDef } from "@tanstack/react-table";
import { Listbox } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { DataTable } from "~/components/dataTable";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";

export default function ClassView({
	teachers: teachersInit,
	classes: classesInit,
}: {
	teachers: teachersInterface[];
	classes: classesInterface[];
}) {
	const [isOpenModal, setIsOpenModal] = useState(false);
	const [classes, setClasses] = useState(classesInit);

	const [teachers, setTeachers] = useState(teachersInit);
	const router = useRouter();

	const changeTeacher = async (teacher: classesInterface["teacher"], classId: number) => {
		const ref = toast.loading("Edytowanie wychowawcy...");
		const response = await fetch("/class/api/changeTeacher", {
			method: "POST",
			body: JSON.stringify({ classId, teacherId: teacher.id }),
		});

		if (!response.ok)
			return toast.update(ref, { type: "error", isLoading: false, render: "Nie udało się edytować wychowawcy", autoClose: 2000 });

		toast.update(ref, { type: "success", isLoading: false, render: "Wychowawca został edytowany", autoClose: 2000 });
		setTimeout(() => router.refresh(), 1250);

		const newClasses = [...classes];
		const classIndex = newClasses.findIndex((e) => e.id == classId);

		const newTeachers = [...teachers].filter((t) => t.id !== teacher.id);
		newTeachers.push({ ...newClasses[classIndex]!.teacher }); //przywrócenie starego teachera
		newClasses[classIndex] = { ...newClasses[classIndex]!, teacher: { ...teacher } };

		setClasses(newClasses);
		setTeachers(newTeachers);
	};

	const columns: ColumnDef<classesInterface>[] = [
		{
			header: "Klasa",
			accessorKey: "name",
		},
		{
			header: "Wychowawca",
			accessorKey: "",
			cell: ({ row }) => {
				return (
					<Listbox value={row.original.teacher} onChange={(v) => changeTeacher(v, row.original.id)}>
						<div className="relative max-w-xs">
							<Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
								<span className="block truncate">{row.original.teacher.name}</span>
								<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
									<ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
								</span>
							</Listbox.Button>

							<Listbox.Options
								className={
									"absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
								}
							>
								{teachers.map((teacher) => (
										key={teacher.id}
										value={teacher}
										className={({ active }) =>
											`relative cursor-pointer select-none py-2 pl-10 pr-4 ${
												active ? "bg-primary/10" : "text-gray-900"
											}`
										}
									>
										{teacher.name}
									</Listbox.Option>
								))}
							</Listbox.Options>
						</div>
					</Listbox>
				);
			},
		},
	];

	return (
		<>
			<DataTable
				columns={columns}
				data={classes}
				noDataText="No data"
				title="Zarządzanie klasami"
				primaryActionBtn={<Button onClick={() => setIsOpenModal(true)}>Dodaj nową klasę</Button>}
			/>
			<AddClassModal teachers={teachers} isOpen={isOpenModal} setIsOpen={setIsOpenModal} />
		</>
	);
}

interface classesInterface {
	teacherId: number;
	id: number;
	name: string;
	teacher: {
		id: number;
		name: string;
	};
}
