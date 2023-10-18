"use client"

import { FormEvent, useState } from "react"
import { TeacherDto } from "~/types/dtos"
import TeacherItem from "./TeacherItem";

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

        const teacherWithHisPassword = await response.json();

        console.log(`Domyślne hasło: ${teacherWithHisPassword.password}`);

        setTeachersList([...teachersList, teacherWithHisPassword]);
        setFormData({ name: "", email: ""});
    } 

    const deleteTeacher = async (userId: string) => {
        const response = await fetch("/teachers/api", {
            method: "DELETE",
            body: JSON.stringify({userId})
        }).catch(e => console.log(e));

        if(response.ok) {
            console.log(response);
            setTeachersList(teachersList.filter(teacher => teacher.userId != userId));
        }
    }

    return (
        <div className="mx-auto w-full">

            <form className="flex flex-col mb-3" onSubmit={onSubmit}>
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
                {teachersList.map((teacher, index) => <TeacherItem teacher={teacher} index={index} key={teacher.userId} deleteTeacher={deleteTeacher} />)}
            </ul>
        </div>
    )
}