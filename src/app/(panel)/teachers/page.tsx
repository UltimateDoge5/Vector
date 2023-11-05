import { type Metadata } from "next";
import TeacherManagement from "~/components/teachers/teachersManagement";
import { db } from "~/server/db";
import { type TeacherDto } from "~/types/dtos";

export const metadata: Metadata = {
  title: 'Nauczyciele | Vector',
  description: 'Panel do zarządzania nauczycielami',
}

export default async function Page() {
  const teachers: TeacherDto[] = await db.query.Teacher.findMany({
    columns: {
      id: true,
      userId: true,
      name: true,
      admin: true,
      classId: true
    }
  })

  return (
    <TeacherManagement teachers={teachers} />
  );
}