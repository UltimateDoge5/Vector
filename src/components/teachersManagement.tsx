"use client"

import { FormEvent, useState } from "react"
import { TeacherDto } from "~/types/dtos"

export default function TeachersManagement({ teachers } : {teachers: TeacherDto[]}) {
    const [teachersList, setTeachersList] = useState(teachers);
    const [formData, setFormData] = useState({ name: "", email: ""})

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if(!formData.email || !formData.name) {
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

        const teacher = await response.json();

        console.log(teacher);
        console.log(`Domyślne hasło: ${teacher.password}`);

        setTeachersList([...teachersList, teacher]);
        setFormData({ name: "", email: ""});
    } 

    return (
        <div className="p-10 mx-auto w-full lg:w-1/2">

            <form className="flex flex-col my-3" onSubmit={onSubmit}>
                <input 
                    type="text" 
                    className="w-full p-4 bg-secondary/30 rounded-lg outline-none text-text flex-1 my-2" 
                    placeholder="Imię i Nazwisko"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value })}
                />

                <input 
                    type="email" 
                    className="w-full p-4 bg-secondary/30 rounded-lg outline-none text-text flex-1 my-2" 
                    placeholder="E-mail" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value })}
                />

                <button className="bg-accent py-4 rounded-lg text-white font-bold mt-2" type="submit">Dodaj</button>
            </form>

            <ul className="border-t-2 py-3">
                {teachersList.map((teacher, index) =>
                    <li key={teacher.id} className="w-full bg-primary text-text p-4 flex items-center gap-2 rounded-lg my-2">
                        <h1 className="flex-1 font-bold text-md">{index + 1}. {teacher.name}</h1>
                    </li>
                )}
            </ul>
        </div>
    )
}