"use client"

import { useState } from "react";
import { ClassDto, StudentDto } from "~/types/dtos";
import AddStudentModal from "./AddStudentModal";
import StudentListItem from "./StudentListItem";

type Props = {
    students: StudentDto[],
    classes: ClassDto[],
}

export default function StudentsManagement({ students, classes }: Props) {
    const [studentsList, setStudentsList] = useState(students);

    const [isOpenModal, setIsOpenModal] = useState(false);

    const addStudent = async (formData: { name: string, email: string }, classId: number) => {
        const payload = {
            firstName: formData.name.split(" ")[0],
            lastName: formData.name.split(" ")[1],
            email: formData.email,
            classId: classId
        };

        const response = await fetch("/students/api", {
            method: "POST",
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const studentWithPassword = await response.json();

            console.log(`Domyślne hasło: ${studentWithPassword.password}`);

            setStudentsList([...studentsList, studentWithPassword]);
        }
    }

    const editStudent = async (userId: string, name: string, classId: number) => {
        const payload = {
            userId,
            firstName: name.split(" ")[0],
            lastName: name.split(" ")[1],
            classId
        };

        const response = await fetch("/students/api", {
            method: "PUT",
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log(response);

            const updatedClass = classes.find(clas => clas.id === classId);

            setStudentsList(studentsList.map(student => student.userId === userId ? { ...student, name, class: updatedClass } : student))
        }
    }

    const deleteStudent = async (userId: string) => {
        const response = await fetch("/students/api", {
            method: "DELETE",
            body: JSON.stringify({ userId })
        });

        if (response.ok) {
            console.log(response);
            setStudentsList(studentsList.filter(student => student.userId != userId));
        }
    }


    return (
        <>
            <div className="mx-auto w-full">

                <div className="flex justify-between items-center mb-5">
                    <h1 className="border-l-accent border-l-4 font-bold px-3 text-3xl">Uczniowie</h1>
                    <button className="bg-primary hover:bg-primary/90 py-3 px-5 rounded-lg text-white font-bold " onClick={() => setIsOpenModal(true)}>Dodaj ucznia</button>
                </div>

                <ul className="border-t-2 py-2">
                    {studentsList.map((student, index) => <StudentListItem student={student} index={index} key={student.userId} deleteStudent={deleteStudent} editStudent={editStudent} classes={classes} />)}
                </ul>
            </div>

            <AddStudentModal
                isOpen={isOpenModal}
                setIsOpen={setIsOpenModal}
                addStudent={addStudent}
                classes={classes}
            />
        </>
    )
}