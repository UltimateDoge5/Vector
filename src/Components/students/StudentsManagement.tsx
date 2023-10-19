"use client"

import { Combobox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { FormEvent, Fragment, useMemo, useState } from "react";
import { ClassDto, StudentDto } from "~/types/dtos";
import StudentListItem from "./StudentListItem";

type Props = {
    students: StudentDto[],
    classes: ClassDto[],
}

export default function StudentsManagement({ students, classes }: Props) {
    const [studentsList, setStudentsList] = useState(students);
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

    const addStudent = async (e: FormEvent) => {
        e.preventDefault();

        if (!formData.email || !formData.name || !selectedClass) {
            alert("Wypełnij poprawnie formularz")
            return;
        }

        const payload = {
            firstName: formData.name.split(" ")[0],
            lastName: formData.name.split(" ")[1],
            email: formData.email,
            classId: selectedClass.id
        };

        const response = await fetch("/students/api", {
            method: "POST",
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const studentWithPassword = await response.json();

            console.log(`Domyślne hasło: ${studentWithPassword.password}`);

            setStudentsList([...studentsList, studentWithPassword]);
            setFormData({ name: "", email: "" });
            setSelectedClass({});
        }
    }

    const editStudent = async (userId: string, name: string, classId: number) => {
        const payload = {
            userId,
            firstName: name.split(" ")[0],
            lastName: name.split(" ")[1],
            classId
        };

        const response = await fetch("/students/api", {
            method: "PUT",
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log(response);

            const updatedClass = classes.find(clas => clas.id === classId);

            setStudentsList(studentsList.map(student => student.userId === userId ? { ...student, name, class: updatedClass } : student))
        }
    }

    const deleteStudent = async (userId: string) => {
        const response = await fetch("/students/api", {
            method: "DELETE",
            body: JSON.stringify({ userId })
        });

        if (response.ok) {
            console.log(response);
            setStudentsList(studentsList.filter(student => student.userId != userId));
        }
    }

    return (
        <div className="mx-auto w-full">

            <div className="flex justify-between items-center mb-5">
                <h1 className="border-l-accent border-l-4 font-bold px-3 text-2xl">Uczniowie</h1>
                <button>dodaj</button>
            </div>

            <form className="flex flex-col mb-2" onSubmit={addStudent}>
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
                    className="bg-accent hover:bg-accent/90 py-3 rounded-lg text-white font-bold mt-2 disabled:bg-accent/50 disabled:cursor-not-allowed transition"
                    type="submit"
                    disabled={!formData.name || !formData.email || !selectedClass}

                >Dodaj</button>
            </form>

            <ul className="border-t-2 py-2">
                {studentsList.map((student, index) => <StudentListItem student={student} index={index} key={student.userId} deleteStudent={deleteStudent} editStudent={editStudent} classes={classes} />)}
            </ul>

        </div>
    )
}