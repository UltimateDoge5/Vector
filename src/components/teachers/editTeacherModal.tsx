"use client"

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { type TeacherDto } from '~/types/dtos';
import { Input } from '../ui/input';
import { ActionModal } from '../ui/modal';

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

    const onSubmit = () => {
        if (!name) {
            return toast("Wypełnij poprawnie formularz", { autoClose: 3000, position: "bottom-center", type: "error" });
        }

        editTeacher(teacher!.userId, name);
        setIsOpen(false);
    }


    return (
        <ActionModal
            open={isOpen}
            setOpen={setIsOpen}
            dismissible={true}
            title={`Edytuj ${teacher!.name}`}
            actionText={"Edytuj"}
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
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </form>
        </ActionModal>
    )
}