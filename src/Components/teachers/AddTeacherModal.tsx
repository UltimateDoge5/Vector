"use client"

import { Dialog, Transition } from '@headlessui/react';
import { FormEvent, Fragment, useState } from 'react';

interface Props {
    isOpen: boolean,
    setIsOpen: (state: boolean) => void,
    addTeacher: (formData: { name: string, email: string }) => void
}

export default function AddTeacherModal({ isOpen, setIsOpen, addTeacher }: Props) {
    const [formData, setFormData] = useState({ name: "", email: "" })

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!formData.email || !formData.name) {
            alert("Wypełnij poprawnie formularz")
            return;
        }

        addTeacher(formData);

        setFormData({ name: "", email: "" });
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
                                    Dodaj nowego nauczyciela
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

                                    <button className="bg-primary hover:bg-primary/90 py-3 rounded-lg text-text font-bold mt-2 disabled:bg-primary/50 disabled:cursor-not-allowed transition" type="submit" disabled={!formData.name || !formData.email}>Dodaj</button>
                                </form>

                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}