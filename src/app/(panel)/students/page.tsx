import { type Metadata } from "next";
import StudentsManagement from "~/components/students/studentsManagement";
import { db } from "~/server/db";
import { type ClassDto, type StudentWithClassDto } from "~/types/dtos";

export const metadata: Metadata = {
  title: 'Uczniowie | Vector',
  description: 'Panel do zarządzania uczniami',
}

export default async function Page() {
  const students: StudentWithClassDto[] = await db.query.Student.findMany({
    with: {
      class: {
        columns: {
          id: true,
          name: true,
          teacherId: true
        }
      }
    },
    columns: {
      id: true,
      userId: true,
      name: true,
      classId: true,
    }
  })

  const classes: ClassDto[] = await db.query.Class.findMany({
    columns: {
      id: true,
      teacherId: true,
      name: true
    }
  })

  return (
    <StudentsManagement students={students} classes={classes} />
  );
}