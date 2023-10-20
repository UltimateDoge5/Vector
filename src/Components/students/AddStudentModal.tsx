"use client"

import { Combobox, Dialog, Transition } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/24/outline';
import { FormEvent, Fragment, useMemo, useState } from 'react';
import { ClassDto } from '~/types/dtos';

type Props = {
    isOpen: boolean,
    setIsOpen: (state: boolean) => void,
    addStudent: (formData: { name: string, email: string }, classId: number) => void,
    classes: ClassDto[]
}

export default function AddStudentModal({ isOpen, setIsOpen, addStudent, classes }: Props) {
    const [formData, setFormData] = useState({ name: "", email: "" })

    const [selectedClass, setSelectedClass] = useState<ClassDto>();
    const [query, setQuery] = useState('')

    const filteredClasses = useMemo(
        () => query === ''
            ? classes
            : classes.filter((classItem) =>
                classItem.name
                    .toLowerCase()
                    .replace(/\s+/g, '')
                    .includes(query.toLowerCase().replace(/\s+/g, ''))
            ), [query, classes]);


    const onSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !selectedClass) {
            alert("Wypełnij poprawnie formularz");
            return;
        }

        addStudent(formData, selectedClass.id);

        setFormData({ name: "", email: "" });
        setSelectedClass({});
        setIsOpen(false);
    }

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
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-bold leading-6 text-gray-900"
                                >
                                    Dodaj nowego ucznia
                                </Dialog.Title>

                                <form className="flex flex-col my-3" onSubmit={onSubmit}>
                                    <input
                                        type="text"
                                        className="w-full p-3 bg-secondary/30 rounded-lg outline-none text-text flex-1 my-2"
                                        placeholder="Imię i Nazwisko"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />

                                    <input
                                        type="email"
                                        className="w-full p-3 bg-secondary/30 rounded-lg outline-none text-text flex-1 my-2"
                                        placeholder="E-mail"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />

                                    <Combobox value={selectedClass} onChange={setSelectedClass}>
                                        <div className="relative mt-1">
                                            <Combobox.Input
                                                className="w-full p-3 bg-secondary/30 rounded-lg outline-none text-text flex-1 my-2"
                                                displayValue={(classItem: ClassDto) => classItem.name}
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

                                    <button
                                        className="bg-primary hover:bg-primary/90 py-3 rounded-lg text-white font-bold mt-2 disabled:bg-primary/50 disabled:cursor-not-allowed transition"
                                        type="submit"
                                        disabled={!formData.name || !formData.email || !selectedClass}

                                    >Dodaj</button>
                                </form>

                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}