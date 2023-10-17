import { currentUser } from "@clerk/nextjs";
import TeachersManagement from "~/components/teachersManagement";
import { db } from "~/server/db";
import { TeacherDto } from "~/types/dtos";

export default async function Page() {
  const teachers: TeacherDto[] = await db.query.Teacher.findMany({
    columns: {
      id: true,
      userId: true,
      name: true,
      admin: true
    }
  })

  const user = await currentUser();

  console.log(user?.emailAddresses[0]?.emailAddress);

  return (
    <TeachersManagement teachers={teachers} />
  );
}