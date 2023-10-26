import { type Class, type Student, type Teacher } from "~/server/db/schema"

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
