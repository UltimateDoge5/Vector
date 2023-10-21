"use client";
import { Dialog, Listbox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { type FormEvent, Fragment, useReducer, useState, useRef } from "react";
import { type teachersInterface } from "~/app/(panel)/class/page";

type Props = {
	isOpen: boolean;
	setIsOpen: (state: boolean) => void;
	teachers: teachersInterface[];
};

export default function AddClassModal({ teachers, isOpen, setIsOpen }: Props) {
	const [formData, setFormData] = useReducer((prev: formDataInterface, next: Partial<formDataInterface>) => ({ ...prev, ...next }), {
		className: "",
		teacherName: teachers[0]!.name,
		teacherId: teachers[0]!.id,
	});

	const [selectedTeachers, setSelectedTeachers] = useState<number[]>([]);
	const cancelButtonRef = useRef(null);

	interface formDataInterface {
		className: string;
		teacherName: string;
		teacherId: number;
	}

	const onSubmit = async (e: FormEvent) => {
		e.preventDefault();

		if (!formData.className) {
			alert("Wypełnij poprawnie formularz");
			return;
		}

		const payload = {
			className: formData.className,
			teacherId: formData.teacherId,
		};

		const response = await fetch("/class/api", {
			method: "POST",
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			alert(`error | ${response.status}`);
			return;
		}

		setIsOpen(false);
		setSelectedTeachers([...selectedTeachers, formData.teacherId]);
		setFormData({ className: "", teacherName: "", teacherId: -1 });
	};

	return (
		<Transition appear show={isOpen} as={Fragment}>
			<Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-black bg-opacity-25" />
				</Transition.Child>

				<div className="fixed inset-0 overflow-y-auto">
					<div className="flex min-h-full items-center justify-center p-4 text-center">
						<Transition.Child
							as={Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0 scale-95"
							enterTo="opacity-100 scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 scale-100"
							leaveTo="opacity-0 scale-95"
						>
							<Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
								<div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
									<div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
										<Dialog.Title as="h1" className="border-b pb-2 font-semibold leading-6 sm:text-lg">
											Dodaj nową klasę
										</Dialog.Title>
										<div className="mt-2">
											<form className="my-3 flex flex-col" onSubmit={onSubmit}>
												<span className="mt-4 font-medium">Nazwa klasy</span>
												<input
													type="text"
													className="my-2 w-full flex-1 rounded-lg bg-secondary/30 p-4 text-text outline-none"
													placeholder="5P"
													value={formData.className}
													onChange={(e) => setFormData({ className: e.target.value })}
												/>
												<span className="mt-4 font-medium">Wychowawca</span>
												<Listbox
													value={{ id: formData.teacherId, name: formData.teacherName }}
													onChange={(value) => {
														setFormData({ teacherName: value.name, teacherId: value.id });
													}}
												>
													<div className="relative mt-2 m-auto w-full">
														<Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-accent/10 p-4 text-left focus:outline-none sm:text-base">
															<span className="block truncate">{formData.teacherName}</span>
															<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
																<ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
															</span>
														</Listbox.Button>
														<Transition
															as={Fragment}
															leave="transition ease-in duration-100"
															leaveFrom="opacity-100"
															leaveTo="opacity-0"
														>
															<Listbox.Options className="absolute  mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-base">
																{teachers
																	.filter((teacherId) => !selectedTeachers.includes(teacherId.id))
																	.map((teacher) => (
																		<Listbox.Option
																			key={teacher.id}
																			className={
																				"relative cursor-pointer select-none py-2 pl-10 pr-4 hover:bg-primary/60"
																			}
																			value={teacher}
																		>
																			{teacher.name}
																		</Listbox.Option>
																	))}
															</Listbox.Options>
														</Transition>
													</div>
												</Listbox>
											</form>
										</div>
									</div>
								</div>
								<div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
									<button
										type="submit"
										className="inline-flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto"
										onClick={() => setIsOpen(false)}
									>
										Dodaj
									</button>
									<button
										type="button"
										className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
										onClick={() => setIsOpen(false)}
										ref={cancelButtonRef}
									>
										Anuluj
									</button>
								</div>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition>
	);
}
