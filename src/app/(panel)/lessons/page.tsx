import { type Metadata } from "next";
import { db } from "~/server/db";
import { type LessonDto } from "~/types/dtos";
import LessonsView from "./view";

export const metadata: Metadata = {
    title: 'Przedmioty | Vector',
}

export default async function Page() {
    const lessons: LessonDto[] = await db.query.Lesson.findMany({
        columns: {
            id: true,
            name: true
        }
    })
    return (
        <LessonsView lessons={lessons} />
    );
}