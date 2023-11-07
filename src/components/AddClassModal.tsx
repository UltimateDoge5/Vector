"use client";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { Fragment, useReducer, useState } from "react";
import { toast } from "react-toastify";
import { type teachersInterface } from "~/app/(panel)/class/page";
import { Input } from "./ui/input";
import { ActionModal } from "./ui/modal";

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

	interface formDataInterface {
		className: string;
		teacherName: string;
		teacherId: number;
	}
	const router = useRouter();
	const onSubmit = async () => {
		if (!formData.className) {
			alert("Wypełnij poprawnie formularz");
			return;
		}

		const payload = {
			className: formData.className,
			teacherId: formData.teacherId,
		};
		const ref = toast.loading("Dodawanie klasy...");

		const response = await fetch("/class/api", {
			method: "POST",
			body: JSON.stringify(payload),
		});

		if (!response.ok)
			return toast.update(ref, { type: "error", isLoading: false, render: "Nie udało się dodać klasy", autoClose: 2000 });

		toast.update(ref, { type: "success", isLoading: false, render: "Klasa została dodana", autoClose: 2000 });
		setTimeout(() => router.replace("/class"), 1000);

		setIsOpen(false);
		setSelectedTeachers([...selectedTeachers, formData.teacherId]);
		setFormData({ className: "", teacherName: "", teacherId: -1 });
	};

	return (
		<ActionModal
			open={isOpen}
			setOpen={setIsOpen}
			dismissible={true}
			title={"Dodaj klasę"}
			actionText={"Dodaj"}
			icon={false}
			onConfirm={onSubmit}
			colors={{
				accent: "bg-accent/20 text-accent",
				button: "bg-primary text-text hover:bg-primary/90",
			}}
			titleClassName="text-2xl"
		>
			<form className="my-3 flex flex-col" onSubmit={onSubmit}>
				<span className="mt-4 font-medium">Nazwa klasy</span>
				<Input
					color={"secondary"}
					name="name"
					value={formData.className}
					onChange={(e) => setFormData({ ...formData, className: e.target.value })}
				/>
				<span className="mt-4 font-medium">Wychowawca</span>
				<Listbox
					value={{ id: formData.teacherId, name: formData.teacherName }}
					onChange={(value) => {
						setFormData({ teacherName: value.name, teacherId: value.id });
					}}
				>
					<div className="relative m-auto mt-2 w-full">
						<Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-accent/10 p-4 text-left focus:outline-none sm:text-base">
							<span className="block truncate">{formData.teacherName}</span>
							<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
								<ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
							</span>
						</Listbox.Button>
						<Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
							<Listbox.Options className="absolute  mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-base">
								{teachers
									.filter((teacherId) => !selectedTeachers.includes(teacherId.id))
									.map((teacher) => (
										<Listbox.Option
											key={teacher.id}
											className={"relative cursor-pointer select-none py-2 pl-10 pr-4 hover:bg-primary/60"}
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
		</ActionModal>
	);
}
