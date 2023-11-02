"use client"

import { Menu, Transition } from "@headlessui/react";
import { ArchiveBoxXMarkIcon, EllipsisVerticalIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { type ColumnDef } from "@tanstack/react-table";
import { Fragment, useState } from "react";
import { DataTable } from "~/components/dataTable";
import { type ClassDto, type LessonDto, type LessonGroupDto, type TeacherDto } from "~/types/dtos";
import AddModal from "./addModal";
import EditModal from "./editModal";

interface Props {
    lessonGroups: LessonGroupDto[],
    selectedClass: ClassDto,
    lessons: LessonDto[],
    teachers: TeacherDto[]
}

interface EditModalState {
    lessonGroupId: number | undefined,
    lesson: LessonDto | undefined,
    teacher: TeacherDto | undefined,
    isOpen: boolean
}

export default function LessonGroupsView({ lessonGroups, selectedClass, lessons, teachers }: Props) {
    const [lessonGroupsList, setLessonGroupsList] = useState(lessonGroups);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editModalState, setEditModalState] = useState<EditModalState>({ lessonGroupId: undefined, lesson: undefined, teacher: undefined, isOpen: false });


    const addLessonGroup = async (teacherId: number, lessonId: number) => {
        const payload = {
            classId: selectedClass.id,
            teacherId,
            lessonId
        }

        const response = await fetch("/class/lessons/api", {
            method: "POST",
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const newLessonGroup: LessonGroupDto = await response.json() as LessonGroupDto;

            setLessonGroupsList([...lessonGroupsList, newLessonGroup]);
        }
    }

    const editLessonGroup = async (teacherId: number, lessonId: number) => {
        const payload = {
            id: editModalState.lessonGroupId,
            teacherId,
            lessonId
        }

        const response = await fetch("/class//lessons/api", {
            method: "PUT",
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const searchedTeacher = teachers.find(teacher => teacher.id === teacherId)!;
            const searchedLesson = lessons.find(lesson => lesson.id === lessonId)!;

            setLessonGroupsList(lessonGroupsList.map(lessonGroup => lessonGroup.id === editModalState.lessonGroupId ? { ...lessonGroup, teacher: [searchedTeacher], lesson: [searchedLesson] } : lessonGroup));
        }
    }

    const deleteLessonGroup = async (lessonGroupId: number) => {
        const response = await fetch("/class/lessons/api", {
            method: "DELETE",
            body: JSON.stringify({ id: lessonGroupId })
        });

        if (response.ok) {
            setLessonGroupsList(lessonGroupsList.filter(lessonGroup => lessonGroup.id != lessonGroupId));
        }
    }

    const columns: ColumnDef<LessonGroupDto>[] = [
        {
            header: "Klasa",
            accessorKey: "",
            cell: ({ row }) => <>{row.original.class[0]?.name}</>
        },
        {
            header: "Przedmiot",
            accessorKey: "",
            cell: ({ row }) => <>{row.original.lesson[0]?.name}</>
        },
        {
            header: "Nauczyciel",
            accessorKey: "",
            cell: ({ row }) => <>{row.original.teacher[0]?.name}</>
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
                            <div className="px-1 py-1" onClick={() => setEditModalState({ lessonGroupId: row.original.id, lesson: row.original.lesson[0], teacher: row.original.teacher[0], isOpen: true })}>
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

                            <div className="px-1 py-1" onClick={() => deleteLessonGroup(row.original.id)}>
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

                        </Menu.Items>
                    </Transition>
                </Menu>
            )
        }
    ];

    return (
        <>
            <DataTable
                columns={columns}
                data={lessonGroupsList}
                noDataText="Brak przedmiotów dla tej klasy"
                title={`Przedmioty dla klasy ${selectedClass.name}`}
                primaryActionBtn={<button className="bg-primary hover:bg-primary/90 py-3 px-5 rounded-lg text-text font-bold " onClick={() => setIsAddModalOpen(true)}>Dodaj przedmiot</button>}
            />

            <AddModal
                open={isAddModalOpen}
                setOpen={setIsAddModalOpen}
                lessons={lessons}
                teachers={teachers}
                add={addLessonGroup}
            />

            {editModalState.lessonGroupId && editModalState.lesson && editModalState.teacher ? (
                <EditModal
                    open={editModalState.isOpen}
                    setOpen={(open: boolean) => setEditModalState({ ...editModalState, isOpen: open })}
                    lessons={lessons}
                    teachers={teachers}
                    teacher={editModalState.teacher}
                    lesson={editModalState.lesson}
                    edit={editLessonGroup}
                />
            ) : null}
        </>
    )
}