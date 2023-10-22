"use client"

import { Menu, Transition } from "@headlessui/react";
import { ArchiveBoxXMarkIcon, EllipsisVerticalIcon, PencilSquareIcon, UserMinusIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { ColumnDef } from "@tanstack/react-table";
import { Fragment, useState } from "react";
import { TeacherDto } from "~/types/dtos";
import { DataTable } from "../dataTable";
import AddTeacherModal from "./addTeacherModal";
import EditTeacherModal from "./editTeacherModal";

interface EditModalState {
    teacher: TeacherDto,
    isOpen: boolean
}

export default function TeachersManagement({ teachers }: { teachers: TeacherDto[] }) {
    const [teachersList, setTeachersList] = useState(teachers);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editModalState, setEditModalState] = useState<EditModalState>({ teacher: {}, isOpen: false });

    const addTeacher = async (formData: { name: string, email: string }) => {
        const payload = {
            firstName: formData.name.split(" ")[0],
            lastName: formData.name.split(" ")[1],
            email: formData.email
        };

        const response = await fetch("/teachers/api", {
            method: "POST",
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const teacherWithPassword = await response.json();

            console.log(`Domyślne hasło: ${teacherWithPassword.password}`);

            setTeachersList([...teachersList, teacherWithPassword]);
        }
    }

    const editTeacher = async (userId: string, name: string) => {
        const payload = {
            userId,
            firstName: name.split(" ")[0],
            lastName: name.split(" ")[1],
        };

        const response = await fetch("/teachers/api", {
            method: "PUT",
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log(response);
            setTeachersList(teachersList.map(teacher => teacher.userId === userId ? { ...teacher, name } : teacher))
        }
    }

    const deleteTeacher = async (userId: string) => {
        const response = await fetch("/teachers/api", {
            method: "DELETE",
            body: JSON.stringify({ userId })
        });

        if (response.ok) {
            console.log(response);
            setTeachersList(teachersList.filter(teacher => teacher.userId != userId));
        }
    }

    const toggleAdmin = async (userId: string, admin: boolean) => {
        const response = await fetch("/teachers/api", {
            method: "PATCH",
            body: JSON.stringify({ userId, admin })
        });

        if (response.ok) {
            console.log(response);
            setTeachersList(teachersList.map(teacher => teacher.userId === userId ? { ...teacher, admin } : teacher))
        }
    }

    const columns: ColumnDef<TeacherDto>[] = [
        {
            header: "Imię i Nazwisko",
            accessorKey: "name",
        },
        {
            header: "Admin",
            accessorKey: "",
            cell: ({ row }) => (
                row.original.admin && <span className="rounded-lg text-white bg-accent/60 px-2 py-2 mx-3  font-bold">Admin</span>
            )

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
                        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="px-1 py-1" onClick={() => setEditModalState({ teacher: row.original, isOpen: true })}>
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            className={`${active ? 'bg-accent/50 text-white' : 'text-text'
                                                } group flex w-full items-center rounded-md px-2 py-2 text-sm font-bold`}
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

                            <div className="px-1 py-1 " onClick={() => deleteTeacher(row.original.userId)}>
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            className={`${active ? 'bg-accent/50 text-white' : 'text-text'
                                                } group flex w-full items-center rounded-md px-2 py-2 text-sm font-bold`}
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

                            <div className="px-1 py-1 " onClick={() => toggleAdmin(row.original.userId, !row.original.admin)}>
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            className={`${active ? 'bg-accent/50 text-white' : 'text-text'
                                                } group flex w-full items-center rounded-md px-2 py-2 text-sm font-bold`}
                                        >
                                            {!row.original.admin ? (
                                                <>
                                                    <UserPlusIcon
                                                        className="mr-2 h-5 w-5"
                                                        aria-hidden="true"
                                                    />

                                                    Ustaw admina
                                                </>
                                            ) : (
                                                <>
                                                    <UserMinusIcon
                                                        className="mr-2 h-5 w-5"
                                                        aria-hidden="true" />

                                                    Odbierz admina
                                                </>
                                            )}
                                        </button>
                                    )}
                                </Menu.Item>
                            </div>

                        </Menu.Items>
                    </Transition>
                </Menu >
            )
        }
    ];


    return (
        <div className="px-10">

            <DataTable
                columns={columns}
                data={teachersList}
                noDataText="Brak nauczycieli"
                title="Nauczyciele"
                primaryActionBtn={<button className="bg-primary hover:bg-primary/90 py-3 px-5 rounded-lg text-text font-bold " onClick={() => setIsAddModalOpen(true)}>Dodaj nauczyciela</button>}
            />

            <AddTeacherModal
                isOpen={isAddModalOpen}
                setIsOpen={setIsAddModalOpen}
                addTeacher={addTeacher} />

            <EditTeacherModal
                teacher={editModalState.teacher}
                isOpen={editModalState.isOpen}
                setIsOpen={(state: boolean) => setEditModalState({ ...editModalState, isOpen: state })}
                editTeacher={editTeacher}
            />

        </div>
    )
}