"use client"

import { Combobox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/24/outline';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { type ClassDto, type StudentWithClassDto } from '~/types/dtos';
import { Input } from '../ui/input';
import { ActionModal } from '../ui/modal';

interface Props {
    student: StudentWithClassDto | null,
    isOpen: boolean,
    setIsOpen: (state: boolean) => void,
    editStudent: (userId: string, name: string, classId: number) => void,
    classes: ClassDto[]
}

export default function EditStudentModal({ student, isOpen, setIsOpen, editStudent, classes }: Props) {
    const [name, setName] = useState("");

    const [selectedClass, setSelectedClass] = useState<ClassDto | null>(null);
    const [query, setQuery] = useState("")

    useEffect(() => {
        setName(student!.name);
        setSelectedClass(classes.find(classItem => classItem.id === student!.class?.id) ?? null);
    }, [student, classes])

    const filteredClasses = useMemo(
        () => query === ''
            ? classes
            : classes.filter((classItem) =>
                classItem.name
                    .toLowerCase()
                    .replace(/\s+/g, '')
                    .includes(query.toLowerCase().replace(/\s+/g, ''))
            ), [query, classes]);

    const onSubmit = () => {
        if (!name || !selectedClass) {
            return toast("Wypełnij poprawnie formularz", { autoClose: 3000, position: "bottom-center", type: "error" });
        }

        editStudent(student!.userId, name, selectedClass.id);
        setIsOpen(false);
    }

    return (
        <ActionModal
            open={isOpen}
            setOpen={setIsOpen}
            dismissible={true}
            title={`Edytuj ${student?.name}`}
            actionText={"Edytuj"}
            icon={false}
            onConfirm={onSubmit}
            colors={{
                accent: "bg-accent/20 text-accent",
                button: "bg-primary text-text hover:bg-primary/90"
            }}
        >

            <form className="flex flex-col my-3" onSubmit={onSubmit}>
                <span className="mt-4 font-medium">Imię i Nazwisko</span>
                <Input
                    color={"secondary"}
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <span className="mt-4 font-medium">Klasa</span>
                <Combobox value={selectedClass} onChange={setSelectedClass}>
                    <div className="relative mt-1">
                        <Combobox.Input
                            className="w-full bg-secondary/60 rounded-lg outline-none text-text flex-1 px-4 py-2"
                            displayValue={(classItem: ClassDto | null) => classItem ? classItem.name : ""}
                            onChange={(event) => setQuery(event.target.value)}
                        />
                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronUpDownIcon
                                className="h-5 w-5 text-gray-400"
                                aria-hidden="true"
                            />
                        </Combobox.Button>
                        <Transition
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                            afterLeave={() => setQuery('')}
                        >
                            <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                {filteredClasses.length === 0 && query !== '' ? (
                                    <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                                        Nie znaleziono klasy
                                    </div>
                                ) : (
                                    filteredClasses.map((classItem) => (
                                        <Combobox.Option
                                            key={classItem.id}
                                            className={({ active }) =>
                                                `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-accent/50 text-white' : 'text-text'
                                                }`
                                            }
                                            value={classItem}
                                        >
                                            {({ selected }) => (
                                                <>
                                                    <span
                                                        className={`block truncate ${selected ? 'font-medium' : 'font-normal'
                                                            }`}
                                                    >
                                                        {classItem.name}
                                                    </span>
                                                </>
                                            )}
                                        </Combobox.Option>
                                    ))
                                )}
                            </Combobox.Options>
                        </Transition>
                    </div>
                </Combobox>
            </form>
        </ActionModal>
    )
}