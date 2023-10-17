import { currentUser } from "@clerk/nextjs";
import { db } from "~/server/db";
import { ScheduleView } from "~/app/schedule/view";

export default async function SchedulePage() {
  const user = await currentUser();

  const schedule = await db.query.Schedule.findMany({
    with: {
      class: {
        with: {
          students: {
            where: (student, { eq }) => eq(student.userId, user!.id),
            columns: { id: true },
          },
        },
        columns: { id: true },
      },
      lesson: true,
      teacher: {
        columns: {
          name: true,
        },
      },
      exemptions: true,
    },
    columns: {
      id: true,
      dayOfWeek: true,
      index: true,
      room: true,
    },
  });

  return <ScheduleView schedule={schedule} />;
}
