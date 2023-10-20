"use client"

import { useState } from "react";
import { TeacherDto } from "~/types/dtos";
import AddTeacherModal from "./AddTeacherModal";
import TeacherListItem from "./TeacherListItem";

export default function TeachersManagement({ teachers }: { teachers: TeacherDto[] }) {
    const [teachersList, setTeachersList] = useState(teachers);

    const [isOpenModal, setIsOpenModal] = useState(false);

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


    return (
        <>
            <div className="mx-auto w-full">

                <div className="flex justify-between items-center mb-5">
                    <h1 className="border-l-accent border-l-4 font-bold px-3 text-3xl">Nauczyciele</h1>
                    <button className="bg-primary hover:bg-primary/90 py-3 px-5 rounded-lg text-white font-bold " onClick={() => setIsOpenModal(true)}>Dodaj nauczyciela</button>
                </div>

                <ul className="border-t-2 py-2">
                    {teachersList.map((teacher) => <TeacherListItem teacher={teacher} key={teacher.userId} deleteTeacher={deleteTeacher} editTeacher={editTeacher} toggleAdmin={toggleAdmin} />)}
                </ul>

            </div>

            <AddTeacherModal
                isOpen={isOpenModal}
                setIsOpen={setIsOpenModal}
                addTeacher={addTeacher} />
        </>
    )
}