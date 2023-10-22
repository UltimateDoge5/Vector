"use client"

import { Dialog, Transition } from '@headlessui/react';
import { FormEvent, Fragment, useEffect, useState } from 'react';
import { TeacherDto } from '~/types/dtos';

interface Props {
    teacher: TeacherDto | null
    isOpen: boolean,
    setIsOpen: (state: boolean) => void,
    editTeacher: (userId: string, name: string) => void
}

export default function EditTeacherModal({ teacher, isOpen, setIsOpen, editTeacher }: Props) {
    const [name, setName] = useState("");

    useEffect(() => {
        setName(teacher!.name);
    }, [teacher])

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!name) {
            alert("Wypełnij poprawnie formularz");
            return;
        }

        editTeacher(teacher!.userId, name);
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
                                    Edytuj {teacher!.name}
                                </Dialog.Title>

                                <form className="flex flex-col my-3" onSubmit={onSubmit}>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-secondary/30 rounded-lg outline-none text-text flex-1 my-2"
                                        placeholder="Imię i Nazwisko"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />

                                    <button className="bg-primary hover:bg-primary/90 py-3 rounded-lg text-text font-bold mt-2 disabled:bg-primary/50 disabled:cursor-not-allowed transition" type="submit" disabled={!name}>Edytuj</button>
                                </form>

                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}