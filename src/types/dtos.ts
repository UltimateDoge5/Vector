import { type Lesson, type Class, type Student, type Teacher, type LessonGroup } from "~/server/db/schema"

export type TeacherDto = typeof Teacher.$inferSelect;

export interface TeacherWithPasswordDto extends TeacherDto {
    password: string | undefined
};

export type StudentDto = typeof Student.$inferSelect;

export interface StudentWithClassDto extends StudentDto {
    class: ClassDto,
}

export interface StudentWithPasswordDto extends StudentWithClassDto {
    password: string | undefined
};

export type ClassDto = typeof Class.$inferSelect;

export type LessonDto = typeof Lesson.$inferSelect;

type LessonGroup = typeof LessonGroup.$inferSelect
export interface LessonGroupDto extends LessonGroup {
    teacher: TeacherDto[],
    class: ClassDto[],
    lesson: LessonDto[],
};
