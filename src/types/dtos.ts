import {
	type Assignment,
	type Class,
	type Lesson,
	type LessonGroup,
	type Student,
	type Submission,
	type Teacher,
} from "~/server/db/schema";

export type TeacherDto = typeof Teacher.$inferSelect;

export interface TeacherWithPasswordDto extends TeacherDto {
	password: string | undefined;
}

export type StudentDto = typeof Student.$inferSelect;

export interface StudentWithClassDto extends StudentDto {
	class: ClassDto;
}

export interface StudentWithPasswordDto extends StudentWithClassDto {
	password: string | undefined;
}

export type ClassDto = typeof Class.$inferSelect;

export type LessonDto = typeof Lesson.$inferSelect;

export type SubmissionDto = typeof Submission.$inferSelect;
export type AssignmentDto = typeof Assignment.$inferSelect;

type LessonGroup = typeof LessonGroup.$inferSelect;

export interface LessonGroupDto extends LessonGroup {
	teacher: TeacherDto;
	class: ClassDto;
	lesson: LessonDto;
}
