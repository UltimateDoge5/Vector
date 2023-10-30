"use client";

import { Listbox, Menu, Transition } from "@headlessui/react";
import { ArchiveBoxXMarkIcon, CheckIcon, ChevronUpDownIcon, EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { type ColumnDef } from "@tanstack/react-table";
import { Fragment, useReducer, useState } from "react";
import { DataTable } from "~/components/dataTable";
import { ActionModal } from "~/components/ui/modal";
import { type Announcements } from "~/server/db/schema";

const dateFormat = Intl.DateTimeFormat("pl", { day: "numeric", month: "long", year: "numeric" });

export function AnnouncementsView({
	classes,
	announcements: announcementsInit,
}: {
	classes: IClasses[];
	announcements: IAnnouncements[];
}) {
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [formData, setFormData] = useReducer(
		(prev: Omit<IAnnouncements, "id">, next: Partial<Omit<IAnnouncements, "id">>) => ({ ...prev, ...next }),
		{
			date: new Date(),
			name: "",
			description: "",
			recipients: {
				teachers: false,
				classes: [],
			},
		},
	);

	const [announcements, setAnnouncements] = useState(announcementsInit);
	const [loading, setLoading] = useState(false);

	const addAnnouncements = async () => {
		if (!formData.name || !formData.description) {
			alert("Wypełnij poprawnie formularz");
			return;
		}

		setLoading(true);
		const res = await fetch("/announcements/api", {
			method: "POST",
			body: JSON.stringify(formData),
		});

		setLoading(false);

		if (!res.ok) {
			alert("Wystąpił błąd podczas wysyłania usprawiedliwień");
			return;
		}

		const { id } = (await res.json()) as { id: number };

		setAnnouncements([...announcements, { ...formData, id }]);

		setFormData({ name: "", description: "", recipients: { teachers: false, classes: [] } });
		setIsAddModalOpen(false);
	};

	const deleteAnnouncement = (_id: number) => {
		return;
	};

	const columns: ColumnDef<IAnnouncements>[] = [
		{
			header: "Tytuł",
			accessorKey: "name",
		},
		{
			header: "Opis",
			accessorKey: "description",
		},
		{
			header: "Data",
			accessorKey: "date",
			cell: ({ row }) => dateFormat.format(row.getValue("date")),
		},
		{
			header: " ",
			accessorKey: "",
			cell: ({ row }) => (
				<Menu as="div" className="relative inline-block w-full text-right">
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
						<Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
							<div className="px-1 py-1 " onClick={() => deleteAnnouncement(row.original.id)}>
								<Menu.Item>
									{({ active }) => (
										<button
											className={`${
												active ? "bg-red-700 text-white" : "text-red-700"
											} group flex w-full items-center rounded-md px-2 py-2 text-sm font-bold`}
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
			),
		},
	];
	return (
		<>
			<DataTable
				columns={columns}
				data={announcements}
				noDataText="Brak danych"
				title="Ogłoszenia"
				primaryActionBtn={
					<button
						className="rounded-lg bg-primary px-5 py-3 font-bold text-text hover:bg-primary/90 "
						onClick={() => setIsAddModalOpen(true)}
					>
						Dodaj ogłoszenie
					</button>
				}
			/>
			<ActionModal
				open={isAddModalOpen}
				setOpen={setIsAddModalOpen}
				onConfirm={addAnnouncements}
				title={"Dodaj ogłoszenie"}
				actionText={"Dodaj"}
				loading={loading}
			>
				<form className="my-3">
					<span className="mt-4 font-medium">Tytuł</span>
					<input
						type="text"
						className="my-2 w-full flex-1 rounded-lg bg-secondary/30 p-4 text-text outline-none"
						placeholder="Tytuł"
						value={formData.name}
						onChange={(e) => setFormData({ name: e.target.value })}
					/>
					<span className="mt-4 font-medium">Opis</span>
					<input
						type="text"
						className="my-2 w-full flex-1 rounded-lg bg-secondary/30 p-4 text-text outline-none"
						placeholder="Opis"
						value={formData.description ?? ""}
						onChange={(e) => setFormData({ description: e.target.value })}
					/>
					<span>Nauczyciele</span>
					<input
						type="checkbox"
						className=""
						onChange={(e) => setFormData({ recipients: { ...formData.recipients!, teachers: e.target.checked } })}
					/>
					<span className="mt-4 font-medium">Klasa</span>
					<Listbox
						value={formData.recipients!.classes}
						onChange={(value) => {
							setFormData({ recipients: { ...formData.recipients!, classes: value } });
						}}
						multiple
					>
						<div className="relative m-auto mt-2 w-full">
							<Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-accent/10 p-4 text-left focus:outline-none sm:text-base">
								<span className="block truncate">
									{formData.recipients!.classes.map((classId) => classes.find((c) => c.id == classId)?.name).join(", ")}
								</span>
								<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
									<ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
								</span>
							</Listbox.Button>
							<Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
								<Listbox.Options className="absolute  mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-base">
									{classes.map((classItem) => (
										<Listbox.Option
											key={classItem.id}
											className={"relative cursor-pointer select-none py-2 pl-10 pr-4 hover:bg-primary/60"}
											value={classItem.id}
										>
											{({ selected, active }) => (
												<>
													<span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
														{classItem.name}
													</span>
													{selected ? (
														<span
															className={`absolute inset-y-0 left-0 flex items-center pl-3 text-primary ${
																active ? "text-white" : ""
															}`}
														>
															<CheckIcon className="h-5 w-5" aria-hidden="true" />
														</span>
													) : null}
												</>
											)}
										</Listbox.Option>
									))}
								</Listbox.Options>
							</Transition>
						</div>
					</Listbox>
				</form>
			</ActionModal>
		</>
	);
}

interface IClasses {
	id: number;
	name: string;
}
type IAnnouncements = typeof Announcements.$inferSelect;
