"use client"

import { Menu, Transition } from "@headlessui/react";
import { ArchiveBoxXMarkIcon, EllipsisVerticalIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { type ColumnDef } from "@tanstack/react-table";
import { Fragment, useState } from "react";
import { toast } from "react-toastify";
import { type ClassDto, type StudentWithClassDto, type StudentWithPasswordDto } from "~/types/dtos";
import { DataTable } from "../dataTable";
import AddStudentModal from "./addStudentModal";
import EditStudentModal from "./editStudentModal";
import { Button } from "~/components/ui/button";

interface Props {
    students: StudentWithClassDto[],
    classes: ClassDto[],
}

interface EditModalState {
    student: StudentWithClassDto | null,
    isOpen: boolean
}

export default function StudentsManagement({ students, classes }: Props) {
    const [studentsList, setStudentsList] = useState(students);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editModalState, setEditModalState] = useState<EditModalState>({ student: null, isOpen: false });

    const addStudent = async (formData: { name: string, email: string }, classId: number) => {
        const payload = {
            firstName: formData.name.split(" ")[0],
            lastName: formData.name.split(" ")[1],
            email: formData.email,
            classId: classId
        };

        let ref = toast("Dodawanie ucznia", { autoClose: false, isLoading: true });
        const response = await fetch("/students/api", {
            method: "POST",
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            toast.update(ref, { render: "Sukces", isLoading: false, type: "success", autoClose: 3000 });

            const studentWithPassword: StudentWithPasswordDto = await response.json() as StudentWithPasswordDto;

            ref = toast(`Domyślne hasło: ${studentWithPassword.password}`, { autoClose: false, position: "top-center", closeOnClick: false, draggable: false, type: "info" });

            setStudentsList([...studentsList, studentWithPassword]);
        } else {
            toast.update(ref, { autoClose: 3000, type: "error", isLoading: false, render: "Nie udało się dodać ucznia." });
        }
    }

    const editStudent = async (userId: string, name: string, classId: number) => {
        const payload = {
            userId,
            firstName: name.split(" ")[0],
            lastName: name.split(" ")[1],
            classId
        };

        const ref = toast("Edytowanie ucznia", { autoClose: false, isLoading: true });
        const response = await fetch("/students/api", {
            method: "PUT",
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            toast.update(ref, { render: "Sukces", isLoading: false, type: "success", autoClose: 3000 });

            const updatedClass = classes.find(clas => clas.id === classId);

            setStudentsList(studentsList.map(student => student.userId === userId ? { ...student, name, class: updatedClass } as StudentWithClassDto : student))
        } else {
            toast.update(ref, { autoClose: 3000, type: "error", isLoading: false, render: "Nie udało się edytować ucznia." });
        }
    }

    const deleteStudent = async (userId: string) => {
        const ref = toast("Usuwanie ucznia", { autoClose: false, isLoading: true });
        const response = await fetch("/students/api", {
            method: "DELETE",
            body: JSON.stringify({ userId })
        });

        if (response.ok) {
            toast.update(ref, { render: "Sukces", isLoading: false, type: "success", autoClose: 3000 });

            setStudentsList(studentsList.filter(student => student.userId != userId));
        } else {
            toast.update(ref, { autoClose: 3000, type: "error", isLoading: false, render: "Nie udało się usunąć ucznia." });
        }
    }

    const columns: ColumnDef<StudentWithClassDto>[] = [
        {
            header: "Imię i Nazwisko",
            accessorKey: "name",
        },
        {
            header: "Klasa",
            accessorKey: "class.name",
        },
        {
            header: " ",
            accessorKey: "",
            cell: ({ row }) => (
                <Menu as="div" className="relative inline-block text-right w-full">
                    <div>
                        <Menu.Button className="inline-flex w-full justify-end rounded-3x px-2 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
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
                        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y z-10 divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="px-1 py-1" onClick={() => setEditModalState({ student: row.original, isOpen: true })}>
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            className={`${active ? 'bg-accent/50 text-white' : 'text-text'
                                                } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                        >
                                            <PencilSquareIcon
                                                className="mr-2 h-5 w-5"
                                                aria-hidden="true"
                                            />
                                            Edytuj
                                        </button>
                                    )}
                                </Menu.Item>
                            </div>

                            <div className="px-1 py-1 " onClick={() => deleteStudent(row.original.userId)}>
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            className={`${active ? 'bg-red-700 text-white' : 'text-red-700'
                                                } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                        >
                                            <ArchiveBoxXMarkIcon
                                                className="mr-2 h-5 w-5"
                                                aria-hidden="true"
                                            />
                                            Usuń
                                        </button>
                                    )}
                                </Menu.Item>
                            </div>

                        </Menu.Items>
                    </Transition>
                </Menu>
            )
        }
    ];

    return (
        <div className="px-10">

            <DataTable
                columns={columns}
                data={studentsList}
                noDataText="Brak uczniów"
                title="Uczniowie"
                primaryActionBtn={<Button onClick={() => setIsAddModalOpen(true)}>Dodaj ucznia</Button>}
            />

            <AddStudentModal
                isOpen={isAddModalOpen}
                setIsOpen={setIsAddModalOpen}
                addStudent={addStudent}
                classes={classes}
            />

            {editModalState.student && <EditStudentModal
                student={editModalState.student}
                isOpen={editModalState.isOpen}
                setIsOpen={(state: boolean) => setEditModalState({ ...editModalState, isOpen: state })}
                editStudent={editStudent}
                classes={classes}
            />}

        </div>
    )
}