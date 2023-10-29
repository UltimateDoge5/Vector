"use client"

import { Menu, Transition } from "@headlessui/react";
import { ArchiveBoxXMarkIcon, EllipsisVerticalIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { type ColumnDef } from "@tanstack/react-table";
import { Fragment, useState } from "react";
import { DataTable } from "~/components/dataTable";
import { Input } from "~/components/ui/input";
import { ActionModal } from "~/components/ui/modal";
import { type LessonDto } from "~/types/dtos";

interface Props {
    lessons: LessonDto[]
}

interface EditModalState {
    lesson: LessonDto | null,
    isOpen: boolean
}

export default function LessonsView({ lessons }: Props) {
    const [lessonsList, setLessonsList] = useState(lessons);
    const [lessonName, setLessonName] = useState("");

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editModalState, setEditModalState] = useState<EditModalState>({ lesson: null, isOpen: false });

    const setEditModalOpen = (open: boolean) => setEditModalState({ ...editModalState, isOpen: open })
    const setEditModalLessonName = (name: string) => setEditModalState({ ...editModalState, lesson: { id: editModalState.lesson!.id, name } })

    const addLesson = async () => {
        const response = await fetch("/lessons/api", {
            method: "POST",
            body: JSON.stringify({ name: lessonName })
        });

        if (response.ok) {
            const newLesson: LessonDto = await response.json() as LessonDto;

            setLessonsList([...lessonsList, newLesson]);
        }
    }

    const editLesson = async () => {
        const response = await fetch("/lessons/api", {
            method: "PUT",
            body: JSON.stringify({ name: editModalState.lesson?.name, id: editModalState.lesson?.id })
        });

        if (response.ok) {
            const { name, id } = editModalState.lesson!;

            setLessonsList(lessonsList.map(lesson => lesson.id === id ? { ...lesson, name } : lesson));
        }
    }

    const deleteLesson = async (lessonId: number) => {
        const response = await fetch("/lessons/api", {
            method: "DELETE",
            body: JSON.stringify({ id: lessonId })
        });

        if (response.ok) {
            setLessonsList(lessonsList.filter(lesson => lesson.id != lessonId));
        }
    }

    const columns: ColumnDef<LessonDto>[] = [
        {
            header: "Nazwa",
            accessorKey: "name",
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
                            <div className="px-1 py-1" onClick={() => setEditModalState({ lesson: row.original, isOpen: true })}>
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

                            <div className="px-1 py-1 " onClick={() => deleteLesson(row.original.id)}>
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
                data={lessonsList}
                noDataText="Brak przedmiotów"
                title="Przedmioty"
                primaryActionBtn={<button className="bg-primary hover:bg-primary/90 py-3 px-5 rounded-lg text-text font-bold " onClick={() => setIsAddModalOpen(true)}>Dodaj przedmiot</button>}
            />

            <ActionModal
                open={isAddModalOpen}
                setOpen={setIsAddModalOpen}
                title={"Dodaj przedmiot"}
                actionText={"Dodaj"}
                onConfirm={() => addLesson()}
                colors={{
                    accent: "bg-accent/20 text-accent",
                    button: "bg-primary text-text hover:bg-primary/90"
                }}
            >
                <form>
                    <Input
                        color={"secondary"}
                        placeholder="Nazwa"
                        name="name"
                        value={lessonName}
                        onChange={(e) => setLessonName(e.target.value)}
                    />
                </form>
            </ActionModal>

            {editModalState.lesson && (
                <ActionModal
                    open={editModalState.isOpen}
                    setOpen={setEditModalOpen}
                    title={"Edytuj przedmiot"}
                    actionText={"Edytuj"}
                    onConfirm={() => editLesson()}
                    colors={{
                        accent: "bg-accent/20 text-accent",
                        button: "bg-primary text-text hover:bg-primary/90"
                    }}
                >
                    <form>
                        <Input
                            color={"secondary"}
                            placeholder="Nazwa"
                            name="name"
                            value={editModalState.lesson.name}
                            onChange={(e) => setEditModalLessonName(e.target.value)}
                        />
                    </form>
                </ActionModal>
            )}
        </>
    )
}