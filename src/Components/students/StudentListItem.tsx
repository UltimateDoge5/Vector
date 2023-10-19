"use client"

import { Menu, Transition } from "@headlessui/react";
import { ArchiveBoxXMarkIcon, EllipsisVerticalIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { Fragment, useState } from "react";
import { ClassDto, StudentDto } from "~/types/dtos";
import EditStudentModal from "./EditStudentModal";

type Props = {
    student: StudentDto,
    index: number,
    deleteStudent: (userId: string) => void,
    editStudent: (userId: string, name: string, classId: number) => void,
    classes: ClassDto[],
};

export default function StudentListItem({ student, index, deleteStudent, editStudent, classes }: Props) {
    const [isOpenModal, setIsOpenModal] = useState(false);

    return (
        <>
            <li className="w-full bg-secondary/50 text-text py-3 px-5 flex items-center gap-2 rounded-lg my-2 hover:bg-secondary/80 cursor-pointer">
                <div className="flex flex-1 items-center">
                    <h1 className="font-bold text-md">{student.name}</h1>
                    {student.class.name && <span className="rounded-lg text-white bg-accent/60 px-2 mx-3 flex align-center justify-center font-bold">{student.class.name}</span>}
                </div>

                <Menu as="div" className="relative inline-block text-left">
                    <div>
                        <Menu.Button className="inline-flex w-full justify-center rounded-3x px-2 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
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
                            <div className="px-1 py-1" onClick={() => setIsOpenModal(true)}>
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

                            <div className="px-1 py-1 " onClick={() => deleteStudent(student.userId)}>
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
            </li>

            <EditStudentModal
                student={student}
                isOpen={isOpenModal}
                setIsOpen={setIsOpenModal}
                editStudent={editStudent}
                classes={classes}
            />
        </>
    )
}