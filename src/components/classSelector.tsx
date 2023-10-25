"use client";

import { Combobox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/24/outline";
import { usePathname, useRouter } from "next/navigation";
import { Fragment, useState } from "react";

const urlsToRefresh = ["/grades", "/presence", "/schedule"];

export default function ClassSelector({ classes, selectedClassId }: { classes: { name: string; id: number }[]; selectedClassId: number }) {
	const [selectedClass, setSelectedClass] = useState(classes.find((c) => c.id === selectedClassId)!);
	const [query, setQuery] = useState("");
	const router = useRouter();
	const pathname = usePathname();

	const filteredClasses =
		query === "" ? classes : classes.filter((classObj) => classObj.name.toLowerCase().includes(query.toLowerCase()));

	// Update the cookie
	const updateCookie = (id: number) => {
		document.cookie = `selectedClassId=${id}; path=/; max-age=31536000`;
		setSelectedClass(classes.find((c) => c.id === id)!);
		if (urlsToRefresh.includes(pathname)) router.refresh();
	};

	return (
		<Combobox value={selectedClass} onChange={(v) => updateCookie(v.id)}>
			<div className="relative">
				<div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white/80 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
					<Combobox.Input
						className="w-full border-none bg-accent/10 py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
						displayValue={(classObj: typeof selectedClass) => `Klasa ${classObj.name}`}
						onChange={(event) => setQuery(event.target.value)}
					/>
					<Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
						<ChevronUpDownIcon className="h-5 w-5 text-text/80" aria-hidden="true" />
					</Combobox.Button>
				</div>
				<Transition
					as={Fragment}
					leave="transition ease-in duration-100"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
					afterLeave={() => setQuery("")}
				>
					<Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
						{filteredClasses.length === 0 && query !== "" ? (
							<div className="relative cursor-default select-none px-4 py-2 text-gray-700">Nie znaleziono takich klas</div>
						) : (
							filteredClasses.map((classObj) => (
								<Combobox.Option
									key={classObj.id}
									className={({ active }) =>
										`relative cursor-default select-none py-2 pl-10 pr-4 ${
											active ? "bg-primary/60 text-text" : "text-gray-900"
										}`
									}
									value={classObj}
								>
									{({ selected, active }) => (
										<>
											<span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
												{classObj.name}
											</span>
											{selected ? (
												<span
													className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
														active ? "text-text" : "text-primary"
													}`}
												>
													<CheckIcon className="h-5 w-5" aria-hidden="true" />
												</span>
											) : null}
										</>
									)}
								</Combobox.Option>
							))
						)}
					</Combobox.Options>
				</Transition>
			</div>
		</Combobox>
	);
}
