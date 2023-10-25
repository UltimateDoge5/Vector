"use client";

import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronDoubleRightIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";
import { type ClassPresence, type StatusChange } from "./teacherView";
import { PresenceLegend, type PresenceStatus } from "./view";

const EditableStatuses: PresenceStatus[] = ["present", "absent", "late", "excused", "releasedBySchool"];

export function PresenceDrawer({ presence, onStatusChange, close, onSave, isUpdating }: PresenceDrawerProps) {
	return (
		<>
			<Transition
				show={presence !== undefined}
				as={Fragment}
				enter="transition ease-out duration-300"
				enterFrom="opacity-0"
				enterTo="opacity-100"
				leave="transition ease-in duration-300"
				leaveFrom="opacity-100"
				leaveTo="opacity-0"
			>
				<div className="absolute left-0 top-0 h-screen w-full bg-black/40" onClick={close} />
			</Transition>

			<div
				className={`fixed right-0 top-0 z-10 h-screen w-2/3 min-w-[256px] overflow-y-auto rounded-l-lg bg-white p-4 transition-transform 
				${presence !== undefined ? "translate-x-0 transform" : "translate-x-full transform"}`}
				aria-labelledby="drawer-label"
			>
				<ChevronDoubleRightIcon className="absolute left-6 top-2 h-6 w-6 cursor-pointer" onClick={close} />
				{presence !== undefined && (
					<div className="flex flex-col items-center justify-center">
						<h2 className="text-2xl">Obecności {presence.lessonName}</h2>
						<p>
							{presence.hours.from}-{presence.hours.to} | {presence.teacherName}
						</p>

						<div className="mt-4 w-full flex-col gap-2 scroll-auto px-4">
							<table className="w-full">
								<thead>
									<tr className="text-left">
										<th>Nr</th>
										<th>Imię i nazwisko</th>
										<th>Obecność</th>
									</tr>
								</thead>
								<tbody>
									{Object.entries(presence.students)
										.sort((a, b) => {
											if (a[1].name.split(" ")[1]! < b[1].name.split(" ")[1]!) {
												return -1;
											}
											if (a[1].name.split(" ")[1]! > b[1].name.split(" ")[1]!) {
												return 1;
											}
											return 0;
										})
										.map(([id, student], i) => (
											<tr key={id} className="border-b py-1">
												<td>{i + 1}</td>
												<td>{student.name}</td>
												<td>
													<PresenceListbox
														status={student.status}
														onStatusChange={(status) =>
															onStatusChange({
																studentId: parseInt(id),
																status,
																scheduleId: presence.scheduleId,
																exemptionId: presence.exemptionId,
															})
														}
													/>
												</td>
											</tr>
										))}
								</tbody>
							</table>
						</div>

						<div className="mt-2 w-full">
							<button
								disabled={isUpdating}
								className="w-full rounded-lg bg-primary/80 px-4 py-2 text-text disabled:cursor-not-allowed disabled:opacity-50"
								onClick={() => {
									onSave();
								}}
							>
								Zapisz zamiany
							</button>
						</div>
					</div>
				)}
			</div>
		</>
	);
}

const PresenceListbox = ({ status, onStatusChange }: { status: PresenceStatus; onStatusChange: (status: PresenceStatus) => void }) => {
	return (
		<Listbox value={status} onChange={(v) => onStatusChange(v)}>
			<div className="relative">
				<Listbox.Button className="relative flex w-full min-w-[256px] cursor-default items-center gap-2 rounded-lg bg-white py-2 pl-3  text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-primary sm:text-sm">
					<div className={`h-4 w-4 rounded-md ${PresenceLegend[status].color}`} />
					<span className="block truncate">{PresenceLegend[status].text}</span>
					<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
						<ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
					</span>
				</Listbox.Button>
				<Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
					<Listbox.Options className=" absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
						{EditableStatuses.map((status) => (
							<Listbox.Option
								key={status}
								value={status}
								className={({ active }) =>
									`${active ? "bg-primary/10" : "text-gray-900"} relative cursor-default select-none py-2 pl-10 pr-4`
								}
							>
								{({ selected }) => (
									<div className="flex items-center gap-2">
										<div className={`h-4 w-4 rounded-md ${PresenceLegend[status].color}`} />
										<span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
											{PresenceLegend[status].text}
										</span>
										{selected ? (
											<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
												<CheckIcon className="h-5 w-5" aria-hidden="true" />
											</span>
										) : null}
									</div>
								)}
							</Listbox.Option>
						))}
					</Listbox.Options>
				</Transition>
			</div>
		</Listbox>
	);
};

interface PresenceDrawerProps {
	presence: ClassPresence;
	onStatusChange: (status: StatusChange) => void;
	isUpdating: boolean;
	close: () => void;
	onSave: () => void;
}
