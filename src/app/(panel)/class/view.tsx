"use client";
import { useState } from "react";
import AddClassModal from "~/components/AddClassModal";
import { type teachersInterface } from "./page";

import { type ColumnDef } from "@tanstack/react-table";
import { Combobox } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { DataTable } from "~/components/dataTable";

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

	const changeTeacher = async (teacher: classesInterface["teacher"], classId: number) => {
		const response = await fetch("/class/api/changeTeacher", {
			method: "POST",
			body: JSON.stringify({ classId, teacherId: teacher.id }),
		});

		if (!response.ok) {
			alert(`error | ${response.status}`);
			return;
		}

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
					<Combobox value={row.original.teacher} onChange={(v) => changeTeacher(v, row.original.id)}>
						<div className="relative max-w-xs  ">
							<div className="relative cursor-pointer overflow-hidden rounded-lg bg-white pl-2 text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
								<Combobox.Input displayValue={(v: classesInterface["teacher"]) => v.name}  className={'pl-1 outline-none'}/>
								<Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
									<ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
								</Combobox.Button>
							</div>
							<Combobox.Options
								className={
									"absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
								}
							>
								{teachers.map((teacher) => (
									<Combobox.Option
										key={teacher.id}
										value={teacher}
										className={"relative cursor-pointer select-none py-2 pl-10 pr-4"}
									>
										{teacher.name}
									</Combobox.Option>
								))}
							</Combobox.Options>
						</div>
					</Combobox>
				);
			},
		},
	];


	return (
		<>
			<DataTable columns={columns} data={classes} noDataText="No data" title="Zarządzanie klasami" primaryActionBtn={<button className="rounded-lg bg-primary px-4 py-2 font-medium mx-10" onClick={() => setIsOpenModal(true)}>Dodaj nową klasę</button>}/>
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
