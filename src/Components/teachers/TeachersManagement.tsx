"use client"

import { FormEvent, useState } from "react";
import { TeacherDto } from "~/types/dtos";
import TeacherListItem from "./TeacherListItem";

export default function TeachersManagement({ teachers }: { teachers: TeacherDto[] }) {
    const [teachersList, setTeachersList] = useState(teachers);
    const [formData, setFormData] = useState({ name: "", email: "" })

    const addTeacher = async (e: FormEvent) => {
        e.preventDefault();

        if (!formData.email || !formData.name) {
            alert("Wypełnij poprawnie formularz")
            return;
        }

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
            setFormData({ name: "", email: "" });
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
        <div className="mx-auto w-full">

            <div className="flex justify-between items-center mb-5">
                <h1 className="border-l-accent border-l-4 font-bold px-3 text-2xl">Nauczyciele</h1>
                <button>dodaj</button>
            </div>

            <form className="flex flex-col mb-2" onSubmit={addTeacher}>
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

                <button className="bg-accent hover:bg-accent/90 py-3 rounded-lg text-white font-bold mt-2 disabled:bg-accent/50 disabled:cursor-not-allowed transition" type="submit" disabled={!formData.name || !formData.email}>Dodaj</button>
            </form>

            <ul className="border-t-2 py-2">
                {teachersList.map((teacher) => <TeacherListItem teacher={teacher} key={teacher.userId} deleteTeacher={deleteTeacher} editTeacher={editTeacher} toggleAdmin={toggleAdmin} />)}
            </ul>

        </div>
    )
}