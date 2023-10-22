import StudentsManagement from "~/components/students/studentsManagement";
import { db } from "~/server/db";
import { ClassDto, StudentDto } from "~/types/dtos";

export default async function Page() {
  const students: StudentDto[] = await db.query.Student.findMany({
    with: {
      class: {
        columns: {
          id: true,
          name: true
        }
      }
    },
    columns: {
      id: true,
      userId: true,
      name: true,
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