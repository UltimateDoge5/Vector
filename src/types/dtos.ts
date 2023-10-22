import { type Class, type Student, type Teacher } from "~/server/db/schema"

export type TeacherDto = typeof Teacher.$inferSelect;

export type StudentDto = typeof Student.$inferSelect;

export type ClassDto = typeof Class.$inferSelect;
