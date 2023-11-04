"use client"

import { useState } from 'react';
import { toast } from 'react-toastify';
import { Input } from '../ui/input';
import { ActionModal } from '../ui/modal';

interface Props {
    isOpen: boolean,
    setIsOpen: (state: boolean) => void,
    addTeacher: (formData: { name: string, email: string }) => void
}

export default function AddTeacherModal({ isOpen, setIsOpen, addTeacher }: Props) {
    const [formData, setFormData] = useState({ name: "", email: "" })

    const onSubmit = () => {
        if (!formData.email || !formData.name) {
            return toast("Wypełnij poprawnie formularz", { autoClose: 3000, position: "bottom-center", type: "error" });
        }

        addTeacher(formData);

        setFormData({ name: "", email: "" });
        setIsOpen(false);
    }


    return (
        <ActionModal
            open={isOpen}
            setOpen={setIsOpen}
            dismissible={true}
            title={"Dodaj nauczyciela"}
            actionText={"Dodaj"}
            icon={false}
            onConfirm={onSubmit}
            colors={{
                accent: "bg-accent/20 text-accent",
                button: "bg-primary text-text hover:bg-primary/90"
            }}
        >
            <form className="flex flex-col my-3">
                <span className="mt-4 font-medium">Imię i Nazwisko</span>
                <Input
                    color={"secondary"}
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />


                <span className="mt-4 font-medium">E-mail</span>
                <Input
                    color={"secondary"}
                    name="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
            </form>
        </ActionModal>
    )
}